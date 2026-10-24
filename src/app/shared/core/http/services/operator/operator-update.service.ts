import { operatorRequestOptions, requireOperatorResponse } from './operator-request';
import { AppUtils } from '../../../base/app-utils';
import {HttpClient,HttpErrorResponse,HttpHeaders,HttpParams} from '@angular/common/http';
import {Injectable,inject} from '@angular/core';
import {environment} from '../../../../../../environments/environment';
import {SessionService} from '../../../base/services/accounts/session.service';
import {RouteDelayService} from '../../../base/services/platform/route-delay.service';
import type {OperatorDeploymentUpdatePhase,OperatorDeploymentUpdateProgressDto,OperatorDeploymentUpdateProgressHandler,OperatorRollbackDto,OperatorDeploymentUpdateDto} from '../../../contracts/operator/operator-update.interface';
const OPERATOR_NETWORK_ROUTE = '/operator';

const OPERATOR_UPDATES_ROUTE = '/operator/updates';


const UPDATE_POLL_INTERVAL_MS = 750;

const UPDATE_POLL_LIMIT = 800;

const UPDATE_TERMINAL_PHASES = new Set([
  'COMPLETED',
  'FAILED',
  'REJECTED',
  'RECOVERY_REQUIRED'
]);

interface RemoteOperatorAnnouncementLocalization {
  locale: string;
  title: string;
  body: string;
}

interface RemoteOperatorAnnouncementLink {
  relation: string;
  url: string;
}

interface RemoteOperatorUpdateManifest {
  manifestVersion: string;
  releaseVersion: string;
  channel: string;
  publishedAt: string;
  minimumCompatibleVersion: string;
  maximumCompatibleVersion: string;
  artifactUrl: string;
  artifactSizeBytes: number;
  artifactSha256: string;
  packageSigningKeyId: string;
  packageSignature: string;
  releaseNotesUrl: string;
  backupRequired: boolean;
  expectedDowntimeSeconds: number;
  status: string;
  supersedesVersion: string | null;
  supersededByVersion: string | null;
  revocationReason: string | null;
  packageSigningKeyConfigured: boolean;
  packageSigningKeyMatches: boolean;
  packageSignatureVerified: boolean;
}

interface RemoteOperatorAnnouncement {
  sequence: number;
  announcementId: string;
  kind: string;
  severity: string;
  publishedAt: string;
  expiresAt: string | null;
  titleKey: string | null;
  bodyKey: string | null;
  localizations: RemoteOperatorAnnouncementLocalization[];
  links: RemoteOperatorAnnouncementLink[];
  updateManifest: RemoteOperatorUpdateManifest | null;
  updateManifestHash: string | null;
  announcementHash: string;
}

interface RemoteOperatorUpdateJob {
  rollback?: OperatorRollbackDto | null;
  monitorToken?: string | null;
  schemaVersion: number;
  jobId: string;
  phase: string;
  percent: number;
  message: string | null;
  updatedAt: string;
  requestedAt: string;
  requestedBy: string;
  manifestHash: string;
  currentVersion: string;
  targetVersion: string;
  channel: string;
  artifactSha256: string;
  backupPath: string | null;
}

interface RemoteOperatorUpdateEventPage {
  items: Array<{
    sequence: number;
    status: RemoteOperatorUpdateJob;
  }>;
  nextAfter: number;
  terminal: boolean;
}

interface RemoteOperatorUpdatesStatus {
  rollback?: OperatorRollbackDto | null;
  enabled: boolean;
  currentVersion: string;
  latestJob: RemoteOperatorUpdateJob | null;
}
@Injectable({providedIn:'root'})
export class HttpOperatorUpdateService {
  private readonly http = inject(HttpClient);

  private readonly sessionService = inject(SessionService);

  private readonly routeDelay = inject(RouteDelayService);

  private readonly apiBaseUrl = AppUtils.trimEndCharacters((environment.apiBaseUrl ?? '/api'), "/");

  private readonly operatorEndpoint = `${this.apiBaseUrl}${OPERATOR_NETWORK_ROUTE}`;

  private latestUpdateAnnouncement: RemoteOperatorAnnouncement | null = null;

  private latestAnnouncementsCheckedAt: string | null = null;

  private rollbackPoint: OperatorRollbackDto | null = null;

  private activeUpdateJob: RemoteOperatorUpdateJob | null = null;

  private currentDeploymentVersion = '—';

  private updateExecutionEnabled = false;

  async loadDeploymentUpdate(): Promise<OperatorDeploymentUpdateDto> {
    const status = await this.requireResponse(
      OPERATOR_UPDATES_ROUTE,
      this.http.get<RemoteOperatorUpdatesStatus>(
        `${this.operatorEndpoint}/updates`,
        this.requestOptions()
      ).toPromise()
    ).catch(() => { throw new Error('operator.update.error.check'); });
    this.updateExecutionEnabled = status.enabled === true;
    this.currentDeploymentVersion = status.currentVersion?.trim() || '—';
    this.activeUpdateJob = status.latestJob ?? null;
    this.rollbackPoint = status.rollback ?? null;
    const releases = await this.requireResponse(
      `${OPERATOR_UPDATES_ROUTE}/releases`,
      this.http.get<{ checkedAt: string; items: RemoteOperatorAnnouncement[] }>(
        `${this.operatorEndpoint}/updates/releases`, this.requestOptions()
      ).toPromise()
    ).catch((error: unknown) => {
      const status = error instanceof HttpErrorResponse ? error.status : 0;
      throw new Error(status === 412 ? 'operator.update.error.metadata'
        : status === 428 ? 'operator.update.error.key' : 'operator.update.error.check');
    });
    this.latestAnnouncementsCheckedAt = releases.checkedAt;
    this.latestUpdateAnnouncement = releases.items[0] ?? null;

    return this.toDeploymentUpdate(
      this.latestUpdateAnnouncement,
      this.activeUpdateJob
    );
  }

  async applyDeploymentUpdate(
    onProgress?: OperatorDeploymentUpdateProgressHandler
  ): Promise<OperatorDeploymentUpdateDto> {
    if (!this.latestUpdateAnnouncement) {
      await this.loadDeploymentUpdate();
    }
    const announcement = this.latestUpdateAnnouncement;
    if (!this.updateExecutionEnabled || !announcement?.updateManifest || !this.installableUpdate(announcement.updateManifest)) {
      throw new Error('operator.update.error.unavailable');
    }

    return this.executeUpdate(announcement, `${this.operatorEndpoint}/updates`,
      { announcementId: announcement.announcementId.trim() }, onProgress);
  }

  async rollbackDeploymentUpdate(onProgress?: OperatorDeploymentUpdateProgressHandler): Promise<OperatorDeploymentUpdateDto> {
    const point = this.rollbackPoint;
    if (!this.updateExecutionEnabled || !point) throw new Error('operator.update.error.rollback.unavailable');
    const announcement = await this.requireResponse(OPERATOR_UPDATES_ROUTE,
      this.http.get<RemoteOperatorAnnouncement>(
        `${this.operatorEndpoint}/updates/releases/${encodeURIComponent(point.targetVersion)}`,
        this.requestOptions()).toPromise()
    ).catch(() => { throw new Error('operator.update.error.rollback.unavailable'); });
    if (announcement.updateManifest?.artifactSha256 !== point.artifactSha256) {
      throw new Error('operator.update.error.rollback.unavailable');
    }
    return this.executeUpdate(announcement,
      `${this.operatorEndpoint}/updates/jobs/${encodeURIComponent(point.jobId)}/rollback`, {}, onProgress);
  }

  private async executeUpdate(
    announcement: RemoteOperatorAnnouncement,
    endpoint: string,
    approval: object,
    onProgress?: OperatorDeploymentUpdateProgressHandler
  ): Promise<OperatorDeploymentUpdateDto> {
    let job = await this.requireResponse(
      OPERATOR_UPDATES_ROUTE,
      this.http.post<RemoteOperatorUpdateJob>(
        endpoint,
        approval,
        this.requestOptions()
      ).toPromise()
    ).catch(() => { throw new Error('operator.update.error.start'); });
    const monitorToken = job.monitorToken?.trim() || null;
    if (monitorToken && !/^[0-9a-f]{64}$/.test(monitorToken)) {
      throw new Error('operator.update.error.response');
    }
    this.activeUpdateJob = job;
    this.currentDeploymentVersion = job.currentVersion?.trim()
      || this.currentDeploymentVersion;
    onProgress?.(this.toUpdateProgress(job, announcement.updateManifest));

    job = monitorToken ? job : await this.loadUpdateJob(job.jobId).catch((error: unknown) => {
      if (this.transientUpdateReadError(error)) {
        return job;
      }
      throw new Error('operator.update.error.status');
    });
    this.activeUpdateJob = job;
    this.currentDeploymentVersion = job.currentVersion?.trim() || this.currentDeploymentVersion;
    onProgress?.(this.toUpdateProgress(job, announcement.updateManifest));
    if (this.updateJobTerminal(job.phase)) {
      return this.toDeploymentUpdate(announcement, job);
    }

    let after = 0;
    const deadline = Date.now() + UPDATE_POLL_LIMIT * UPDATE_POLL_INTERVAL_MS;
    for (let poll = 0; poll < UPDATE_POLL_LIMIT && Date.now() < deadline; poll += 1) {
      const read = monitorToken
        ? this.loadMonitoredUpdate(job.jobId, monitorToken, after)
        : this.loadUpdateEvents(job.jobId, after);
      const page = await read.catch((error: unknown) => {
        // Installation restarts the API/proxy. Retry only reads of the same
        // accepted job, keeping its cursor and last confirmed progress.
        if (this.transientUpdateReadError(error)) {
          return null;
        }
        throw new Error('operator.update.error.status');
      });
      if (!page) {
        await this.waitForUpdatePoll();
        continue;
      }
      for (const event of page.items) {
        if (event.sequence <= after) {
          continue;
        }
        after = event.sequence;
        job = event.status;
        this.activeUpdateJob = job;
        this.currentDeploymentVersion = job.currentVersion?.trim() || this.currentDeploymentVersion;
        onProgress?.(this.toUpdateProgress(job, announcement.updateManifest));
      }
      after = Math.max(after, Math.max(0, Math.trunc(Number(page.nextAfter) || 0)));
      if (page.terminal || this.updateJobTerminal(job.phase)) {
        return this.toDeploymentUpdate(announcement, job);
      }
      await this.waitForUpdatePoll();
    }
    throw new Error('operator.update.error.status.timeout');
  }

  private transientUpdateReadError(error: unknown): boolean {
    return (error instanceof HttpErrorResponse && [0, 502, 503, 504].includes(error.status))
      || (error instanceof Error && error.message === 'operator.request.timeout');
  }

  private async loadMonitoredUpdate(jobId: string, token: string, after: number): Promise<RemoteOperatorUpdateEventPage> {
    // Same-origin HTTPS; the independent host reader is behind the retained ingress.
    // This job-scoped read capability stays in memory and never enters a URL/storage.
    const route = `/operator-update-status/${encodeURIComponent(jobId)}`;
    const status = await this.requireResponse(route, this.http.get<RemoteOperatorUpdateJob>(route, {
      headers: new HttpHeaders({ Authorization: `UpdateMonitor ${token}` })
    }).toPromise());
    if (status.jobId !== jobId) throw new Error('operator.update.error.response');
    if (status.rollback) this.rollbackPoint = status.rollback;
    return { items: [{ sequence: after + 1, status }], nextAfter: after + 1,
      terminal: this.updateJobTerminal(status.phase) };
  }

  private async loadUpdateJob(jobId: string): Promise<RemoteOperatorUpdateJob> {
    const normalizedJobId = jobId.trim();
    if (!normalizedJobId) {
      throw new Error('operator.update.error.response');
    }
    return await this.requireResponse(
      `${OPERATOR_UPDATES_ROUTE}/jobs/${normalizedJobId}`,
      this.http.get<RemoteOperatorUpdateJob>(
        `${this.operatorEndpoint}/updates/jobs/${encodeURIComponent(normalizedJobId)}`,
        this.requestOptions()
      ).toPromise()
    );
  }

  private async loadUpdateEvents(
    jobId: string,
    after: number
  ): Promise<RemoteOperatorUpdateEventPage> {
    const normalizedJobId = jobId.trim();
    if (!normalizedJobId) {
      throw new Error('operator.update.error.response');
    }
    const params = new HttpParams()
      .set('after', Math.max(0, Math.trunc(Number(after) || 0)))
      .set('limit', 100);
    return await this.requireResponse(
      `${OPERATOR_UPDATES_ROUTE}/jobs/${normalizedJobId}/events`,
      this.http.get<RemoteOperatorUpdateEventPage>(
        `${this.operatorEndpoint}/updates/jobs/${encodeURIComponent(normalizedJobId)}/events`,
        this.requestOptions(params)
      ).toPromise()
    );
  }

  private toDeploymentUpdate(
    announcement: RemoteOperatorAnnouncement | null,
    job: RemoteOperatorUpdateJob | null
  ): OperatorDeploymentUpdateDto {
    const manifest = announcement?.updateManifest ?? null;
    const completed = job?.phase?.trim().toUpperCase() === 'COMPLETED';
    const running = !!job && !this.updateJobTerminal(job.phase);
    const targetVersion = (running ? job?.targetVersion?.trim() : manifest?.releaseVersion?.trim())
      || job?.targetVersion?.trim() || '—';
    const currentVersion = this.currentDeploymentVersion || job?.currentVersion?.trim() || '—';
    return {
      currentVersion,
      rollback: this.rollbackPoint?.fromVersion === currentVersion ? this.rollbackPoint : null,
      availableVersion: targetVersion,
      updateAvailable: Boolean(
        manifest
        && this.updateExecutionEnabled
        && this.installableUpdate(manifest)
        && currentVersion !== targetVersion
      ),
      lastCheckedAt:
        this.latestAnnouncementsCheckedAt
        || job?.updatedAt?.trim()
        || null,
      lastUpdatedAt: completed ? job?.updatedAt?.trim() || null : null,
      progress: job
        ? this.toUpdateProgress(job, manifest)
        : {
            phase: 'IDLE',
            bytesDownloaded: 0,
            bytesTotal: Math.max(0, Number(manifest?.artifactSizeBytes) || 0),
            percent: 0,
            message: null,
            updatedAt: this.latestAnnouncementsCheckedAt
          }
    };
  }

  private toUpdateProgress(
    job: RemoteOperatorUpdateJob,
    manifest: RemoteOperatorUpdateManifest | null
  ): OperatorDeploymentUpdateProgressDto {
    const phase = this.updatePhase(job.phase);
    const percent = Math.max(0, Math.min(100, Math.trunc(Number(job.percent) || 0)));
    const bytesTotal = Math.max(0, Number(manifest?.artifactSizeBytes) || 0);
    let bytesDownloaded = 0;
    if (job.phase?.trim().toUpperCase() === 'DOWNLOADING') {
      const downloadPercent = Math.max(0, Math.min(1, (percent - 10) / 50));
      bytesDownloaded = Math.round(bytesTotal * downloadPercent);
    } else if (['VERIFYING', 'INSTALLING', 'COMPLETED', 'CONFIGURING_PACKAGE', 'LOADING_IMAGES', 'VERIFYING_IMAGES', 'PREPARING_DATA', 'STARTING_SERVICES', 'WAITING_FOR_HEALTH', 'SWITCHING_INGRESS'].includes(phase)) {
      bytesDownloaded = bytesTotal;
    }
    return {
      phase,
      bytesDownloaded,
      bytesTotal,
      percent,
      message: job.phase?.trim().toUpperCase() === 'RECOVERY_REQUIRED'
        ? 'operator.update.error.recovery.required'
        : phase === 'FAILED'
          ? 'operator.update.error.failed'
          : null,
      updatedAt: job.updatedAt?.trim() || null
    };
  }

  private updatePhase(value: string): OperatorDeploymentUpdatePhase {
    switch (value?.trim().toUpperCase()) {
      case 'CHECKING':
        return 'CHECKING';
      case 'DOWNLOADING':
        return 'DOWNLOADING';
      case 'STAGING':
      case 'VERIFYING':
        return 'VERIFYING';
      case 'AWAITING_HOST':
      case 'BACKING_UP':
      case 'INSTALLING':
      case 'RESTARTING':
        return 'INSTALLING';
      case 'CONFIGURING_PACKAGE':
        return 'CONFIGURING_PACKAGE';
      case 'LOADING_IMAGES':
        return 'LOADING_IMAGES';
      case 'VERIFYING_IMAGES':
        return 'VERIFYING_IMAGES';
      case 'PREPARING_DATA':
        return 'PREPARING_DATA';
      case 'STARTING_SERVICES':
        return 'STARTING_SERVICES';
      case 'WAITING_FOR_HEALTH':
        return 'WAITING_FOR_HEALTH';
      case 'SWITCHING_INGRESS':
        return 'SWITCHING_INGRESS';
      case 'COMPLETED':
        return 'COMPLETED';
      case 'FAILED':
      case 'REJECTED':
      case 'RECOVERY_REQUIRED':
        return 'FAILED';
      default:
        return 'CHECKING';
    }
  }

  private updateJobTerminal(value: string): boolean {
    return UPDATE_TERMINAL_PHASES.has(value?.trim().toUpperCase());
  }

  private installableUpdate(manifest: RemoteOperatorUpdateManifest): boolean {
    return manifest.status?.trim().toUpperCase() === 'AVAILABLE'
      && manifest.packageSigningKeyConfigured === true
      && manifest.packageSigningKeyMatches === true
      && manifest.packageSignatureVerified === true;
  }

  private waitForUpdatePoll(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, UPDATE_POLL_INTERVAL_MS));
  }

  private requestOptions(params?: HttpParams): { headers?: HttpHeaders; params?: HttpParams } { return operatorRequestOptions(this.sessionService.currentSession(), params); }

  private async requireResponse<T>(route: string, task: Promise<T | undefined>): Promise<T> { return requireOperatorResponse(this.routeDelay, route, task); }

}
