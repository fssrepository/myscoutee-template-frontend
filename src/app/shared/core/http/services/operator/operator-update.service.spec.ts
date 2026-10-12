import '@angular/compiler';
import {describe,it,expect,vi,beforeEach,afterEach} from 'vitest';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { I18nService } from '../../../base/services/localization/i18n.service';
import { RouteDelayService } from '../../../base/services/platform/route-delay.service';
import { SessionService } from '../../../base/services/accounts/session.service';
import { HttpOperatorUpdateService } from './operator-update.service';

describe('HttpOperatorUpdateService', () => {
  const get = vi.fn();
  const post = vi.fn();
  const put = vi.fn();
  const withRequestTimeout = vi.fn();
  let currentSession: unknown;

  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    put.mockReset();
    withRequestTimeout
      .mockReset()
      .mockImplementation((_route: string, task: Promise<unknown>) => task);
    currentSession = {
      kind: 'demo',
      userId: ' operator-demo-dev '
    };
    TestBed.configureTestingModule({
      providers: [
        HttpOperatorUpdateService,
        { provide: HttpClient, useValue: { get, post, put } },
        {
          provide: SessionService,
          useValue: {
            currentSession: () => currentSession
          }
        },
        {
          provide: I18nService,
          useValue: {
            currentLanguage: () => 'en'
          }
        },
        { provide: RouteDelayService, useValue: { withRequestTimeout } }
      ]
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

it.each([
    [409, 'operator.update.error.check'],
    [412, 'operator.update.error.metadata'],
    [428, 'operator.update.error.key'],
    [502, 'operator.update.error.check']
  ])('keeps update discovery HTTP %s diagnostics out of the UI', async (status, key) => {
    get.mockImplementation((url: string) => {
      if (url === '/api/operator/updates') {
        return of({ enabled: true, currentVersion: '1.0.0', latestJob: null });
      }
      if (url === '/api/operator/updates/releases') {
        return throwError(() => new HttpErrorResponse({
          status: Number(status),
          statusText: 'OK',
          url: 'https://localhost/api/operator/updates/releases',
          error: { detail: 'Internal Registry diagnostic with sensitive configuration' }
        }));
      }
      throw new Error(`Unexpected GET ${url}`);
    });

    await expect(TestBed.inject(HttpOperatorUpdateService).loadDeploymentUpdate())
      .rejects.toThrow(String(key));
    expect(post).not.toHaveBeenCalled();
  });
it('approves a verified update and streams Java status/events into update progress', async () => {
    const announcementPage = remoteAnnouncementPage();
    const checking = remoteUpdateJob('CHECKING', 5, '1.0.0');
    const downloading = remoteUpdateJob('DOWNLOADING', 35, '1.0.0');
    const completed = remoteUpdateJob('COMPLETED', 100, '1.2.3');
    post.mockReturnValue(of(checking));
    get.mockImplementation((url: string) => {
      if (url === '/api/operator/updates') {
        return of({
          enabled: true,
          currentVersion: '1.0.0',
          latestJob: null
        });
      }
      if (url === '/api/operator/updates/releases') {
        return of({ checkedAt: announcementPage.snapshot.asOf, items: announcementPage.items });
      }
      if (url === '/api/operator/updates/jobs/update_job_1') {
        return of(downloading);
      }
      if (url === '/api/operator/updates/jobs/update_job_1/events') {
        return of({
          items: [
            { sequence: 1, status: downloading },
            { sequence: 2, status: completed }
          ],
          nextAfter: 2,
          terminal: true
        });
      }
      throw new Error(`Unexpected GET ${url}`);
    });
    const progress = vi.fn();
    const service = TestBed.inject(HttpOperatorUpdateService);

    const available = await service.loadDeploymentUpdate();
    const result = await service.applyDeploymentUpdate(progress);

    expect(available).toEqual(expect.objectContaining({
      currentVersion: '1.0.0',
      availableVersion: '1.2.3',
      updateAvailable: true,
      progress: expect.objectContaining({ phase: 'IDLE' })
    }));
    expect(post).toHaveBeenCalledWith(
      '/api/operator/updates',
      { announcementId: 'ann_update_1' },
      expect.objectContaining({ headers: expect.any(HttpHeaders) })
    );
    expect(result).toEqual(expect.objectContaining({
      currentVersion: '1.2.3',
      availableVersion: '1.2.3',
      updateAvailable: false,
      lastUpdatedAt: '2026-07-28T18:40:00.000Z',
      progress: expect.objectContaining({
        phase: 'COMPLETED',
        percent: 100,
        bytesDownloaded: 12_345,
        bytesTotal: 12_345
      })
    }));
    expect(progress.mock.calls.map(call => call[0].phase)).toEqual([
      'CHECKING',
      'DOWNLOADING',
      'DOWNLOADING',
      'COMPLETED'
    ]);
    const eventCall = get.mock.calls.find(
      (call: unknown[]) => call[0] === '/api/operator/updates/jobs/update_job_1/events'
    ) as [string, { params: { get(name: string): string | null } }];
    expect(eventCall[1].params.get('after')).toBe('0');
    expect(eventCall[1].params.get('limit')).toBe('100');
    expect(withRequestTimeout.mock.calls.map(call => call[0])).toEqual([
      '/operator/updates',
      '/operator/updates/releases',
      '/operator/updates',
      '/operator/updates/jobs/update_job_1',
      '/operator/updates/jobs/update_job_1/events'
    ]);
  });
it('follows host progress through an API outage with one approval and no reload', async () => {
    const token = 'b'.repeat(64);
    const checking = { ...remoteUpdateJob('CHECKING', 5, '1.0.0'), monitorToken: token };
    const statuses = [remoteUpdateJob('LOADING_IMAGES', 87, '1.0.0'), remoteUpdateJob('PREPARING_DATA', 93, '1.2.3'), remoteUpdateJob('WAITING_FOR_HEALTH', 96, '1.2.3'), remoteUpdateJob('COMPLETED', 100, '1.2.3')];
    const page = remoteAnnouncementPage();
    post.mockReturnValue(of(checking));
    get.mockImplementation((url: string, options: { headers?: HttpHeaders }) => {
      if (url === '/api/operator/updates') return of({ enabled: true, currentVersion: '1.0.0', latestJob: null });
      if (url === '/api/operator/updates/releases') return of({ checkedAt: page.snapshot.asOf, items: page.items });
      if (url === '/operator-update-status/update_job_1') {
        expect(options.headers?.get('Authorization')).toBe(`UpdateMonitor ${token}`);
        return of(statuses.shift());
      }
      throw new Error(`Application API is offline: ${url}`);
    });
    const service = TestBed.inject(HttpOperatorUpdateService);
    vi.spyOn(service as any, 'waitForUpdatePoll').mockResolvedValue(undefined);
    await service.loadDeploymentUpdate();
    const progress = vi.fn();
    const result = await service.applyDeploymentUpdate(progress);
    expect(result.progress.phase).toBe('COMPLETED');
    expect(result.progress.percent).toBe(100);
    expect(result.updateAvailable).toBe(false);
    expect(progress.mock.calls.map(call => call[0].phase)).toEqual(expect.arrayContaining(['LOADING_IMAGES', 'PREPARING_DATA', 'WAITING_FOR_HEALTH', 'COMPLETED']));
    expect(post).toHaveBeenCalledTimes(1);
    expect(get.mock.calls.filter(call => String(call[0]).includes('/jobs/'))).toHaveLength(0);
  });
it('keeps the retained rollback action after an installer failure received from the host reader', async () => {
    const point = {jobId:'update_job_1', fromVersion:'1.2.3', targetVersion:'1.0.0', artifactSha256:'sha256:'+'a'.repeat(64)};
    const page = remoteAnnouncementPage();
    post.mockReturnValue(of({...remoteUpdateJob('CHECKING',5,'1.0.0'),monitorToken:'b'.repeat(64)}));
    get.mockImplementation((url: string) => {
      if (url === '/api/operator/updates') return of({enabled:true,currentVersion:'1.0.0',latestJob:null});
      if (url === '/api/operator/updates/releases') return of({checkedAt:page.snapshot.asOf,items:page.items});
      if (url === '/operator-update-status/update_job_1') return of({...remoteUpdateJob('RECOVERY_REQUIRED',96,'1.2.3'),rollback:point});
      throw new Error(`Application API is offline: ${url}`);
    });
    const service = TestBed.inject(HttpOperatorUpdateService);
    await service.loadDeploymentUpdate();
    const result = await service.applyDeploymentUpdate();
    expect(result.progress.phase).toBe('FAILED');
    expect(result.rollback).toEqual(point);
    expect(post).toHaveBeenCalledTimes(1);
  });
it('offers the newest release even when an older update job is already completed', async () => {
    get.mockImplementation((url: string) => {
      if (url === '/api/operator/updates') return of({ enabled: true, currentVersion: '1.0.0',
        latestJob: { ...remoteUpdateJob('COMPLETED', 100, '1.0.0'), targetVersion: '1.0.0' } });
      if (url === '/api/operator/updates/releases') return of({ checkedAt: '2026-09-16', items: remoteAnnouncementPage().items });
      throw new Error(`Unexpected GET ${url}`);
    });
    const result = await TestBed.inject(HttpOperatorUpdateService).loadDeploymentUpdate();
    expect(result.currentVersion).toBe('1.0.0');
    expect(result.availableVersion).toBe('1.2.3');
    expect(result.updateAvailable).toBe(true);
    expect(post).not.toHaveBeenCalled();
  });
it('rolls back the retained package through one explicit approval and durable job', async () => {
    const announcement = remoteAnnouncementPage().items[0]!;
    const previousJob = 'upd_12345678901234567890123456789012';
    const completed = remoteUpdateJob('COMPLETED', 100, '1.2.3');
    post.mockReturnValue(of(completed));
    get.mockImplementation((url: string) => {
      if (url === '/api/operator/updates') return of({
        enabled: true, currentVersion: '1.3.0', latestJob: null,
        rollback: { jobId: previousJob, fromVersion: '1.3.0', targetVersion: '1.2.3',
          artifactSha256: announcement.updateManifest!.artifactSha256 }
      });
      if (url === '/api/operator/updates/releases') return of({ checkedAt: '2026-09-16', items: [announcement] });
      if (url === '/api/operator/updates/releases/1.2.3') return of(announcement);
      if (url === '/api/operator/updates/jobs/update_job_1') return of(completed);
      throw new Error(`Unexpected GET ${url}`);
    });
    const service = TestBed.inject(HttpOperatorUpdateService);
    expect((await service.loadDeploymentUpdate()).rollback?.jobId).toBe(previousJob);
    const result = await service.rollbackDeploymentUpdate();
    expect(result.progress.phase).toBe('COMPLETED');
    expect(result.rollback).toBeNull();
    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0]?.[0]).toBe(`/api/operator/updates/jobs/${previousJob}/rollback`);
  });
it.each([0, 502, 503, 504])('keeps following the same accepted update across HTTP %s restart gaps', async status => {
    const announcementPage = remoteAnnouncementPage();
    const installing = remoteUpdateJob('INSTALLING', 85, '1.0.0');
    const completed = remoteUpdateJob('COMPLETED', 100, '1.2.3');
    let reads = 0;
    post.mockReturnValue(of(installing));
    get.mockImplementation((url: string) => {
      if (url === '/api/operator/updates') {
        return of({ enabled: true, currentVersion: '1.0.0', latestJob: null });
      }
      if (url === '/api/operator/updates/releases') {
        return of({ checkedAt: announcementPage.snapshot.asOf, items: announcementPage.items });
      }
      if (url === '/api/operator/updates/jobs/update_job_1') {
        return of(installing);
      }
      if (url.endsWith('/events')) {
        reads++;
        return reads === 1
          ? of({ items: [{ sequence: 1, status: installing }], nextAfter: 1, terminal: false })
          : reads === 2
            ? throwError(() => new HttpErrorResponse({ status, url, statusText: 'Restarting' }))
            : of({ items: [{ sequence: 2, status: completed }], nextAfter: 2, terminal: true });
      }
      throw new Error(`Unexpected GET ${url}`);
    });
    const service = TestBed.inject(HttpOperatorUpdateService);
    const wait = vi.spyOn(service as unknown as { waitForUpdatePoll(): Promise<void> }, 'waitForUpdatePoll')
      .mockResolvedValue(undefined);
    try {
      await service.loadDeploymentUpdate();
      const progress = vi.fn();
      const result = await service.applyDeploymentUpdate(progress);
      expect(result.progress.phase).toBe('COMPLETED');
      expect(post).toHaveBeenCalledTimes(1);
      expect(progress.mock.calls.some(call => call[0].phase === 'FAILED')).toBe(false);
      expect(get.mock.calls.filter(call => call[0].endsWith('/events'))
        .map(call => call[1].params.get('after'))).toEqual(['0', '1', '1']);
    } finally {
      wait.mockRestore();
    }
  });
it.each([401, 403, 404])('reports an i18n error without retrying permanent update-read HTTP %s', async status => {
    const announcementPage = remoteAnnouncementPage();
    post.mockReturnValue(of(remoteUpdateJob('INSTALLING', 85, '1.0.0')));
    get.mockImplementation((url: string) => {
      if (url === '/api/operator/updates') {
        return of({ enabled: true, currentVersion: '1.0.0', latestJob: null });
      }
      if (url === '/api/operator/updates/releases') {
        return of({ checkedAt: announcementPage.snapshot.asOf, items: announcementPage.items });
      }
      return throwError(() => new HttpErrorResponse({ status, url, statusText: 'Internal diagnostic' }));
    });
    const service = TestBed.inject(HttpOperatorUpdateService);
    await service.loadDeploymentUpdate();
    await expect(service.applyDeploymentUpdate()).rejects.toThrow('operator.update.error.status');
    expect(post).toHaveBeenCalledTimes(1);
    expect(get.mock.calls.filter(call => call[0].includes('/jobs/'))).toHaveLength(1);
  });
it('reconnects to the durable latest update job and maps recovery-required as terminal failure', async () => {
    const recoveryRequired = remoteUpdateJob(
      'RECOVERY_REQUIRED',
      72,
      '1.0.0'
    );
    get.mockImplementation((url: string) => {
      if (url === '/api/operator/updates') {
        return of({
          enabled: true,
          currentVersion: '1.0.0',
          latestJob: recoveryRequired
        });
      }
      if (url === '/api/operator/updates/releases') {
        return of(remoteAnnouncementPage());
      }
      throw new Error(`Unexpected GET ${url}`);
    });

    const update = await TestBed.inject(HttpOperatorUpdateService)
      .loadDeploymentUpdate();

    expect(update.currentVersion).toBe('1.0.0');
    expect(update.progress).toEqual(expect.objectContaining({
      phase: 'FAILED',
      percent: 72,
      message: 'operator.update.error.recovery.required'
    }));
    expect(get.mock.calls.map((call: unknown[]) => call[0])).toEqual([
      '/api/operator/updates',
      '/api/operator/updates/releases'
    ]);
  });
});
function remoteAnnouncementPage() {
  return {
    snapshot: {
      asOf: '2026-07-28T18:30:00.000Z',
      throughSequence: 1,
      createdAt: '2026-07-28T18:30:00.000Z'
    },
    items: [
      {
        sequence: 1,
        announcementId: 'ann_update_1',
        kind: 'UPDATE',
        severity: 'NOTICE',
        publishedAt: '2026-07-28T18:00:00.000Z',
        expiresAt: null,
        titleKey: null,
        bodyKey: null,
        localizations: [
          {
            locale: 'en',
            title: 'MyScoutee 1.2.3 is available',
            body: 'Install the verified stable release.'
          }
        ],
        links: [
          {
            relation: 'release-notes',
            url: 'https://downloads.example.test/releases/1.2.3'
          }
        ],
        updateManifest: {
          manifestVersion: '1',
          releaseVersion: '1.2.3',
          channel: 'stable',
          publishedAt: '2026-07-28T18:00:00.000Z',
          minimumCompatibleVersion: '1.0.0',
          maximumCompatibleVersion: '2.0.0',
          artifactUrl: 'https://downloads.example.test/myscoutee_1.2.3_amd64.deb',
          artifactSizeBytes: 12_345,
          artifactSha256: 'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
          packageSigningKeyId: 'pkey_86dfce4288ce436029e7236ac60b0604',
          packageSignature: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
          releaseNotesUrl: 'https://downloads.example.test/releases/1.2.3',
          backupRequired: true,
          expectedDowntimeSeconds: 90,
          status: 'AVAILABLE',
          supersedesVersion: null,
          supersededByVersion: null,
          revocationReason: null,
          packageSigningKeyConfigured: true,
          packageSigningKeyMatches: true,
          packageSignatureVerified: true
        },
        updateManifestHash: 'sha256:manifest',
        announcementHash: 'sha256:announcement'
      }
    ],
    nextCursor: null
  };
}
function remoteUpdateJob(phase: string, percent: number, currentVersion: string) {
  return {
    schemaVersion: 1,
    jobId: 'update_job_1',
    phase,
    percent,
    message: null,
    updatedAt: phase === 'COMPLETED'
      ? '2026-07-28T18:40:00.000Z'
      : '2026-07-28T18:35:00.000Z',
    requestedAt: '2026-07-28T18:34:00.000Z',
    requestedBy: 'operator-real',
    manifestHash: 'sha256:manifest',
    currentVersion,
    targetVersion: '1.2.3',
    channel: 'stable',
    artifactSha256: 'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    backupPath: phase === 'COMPLETED' ? '/var/backups/myscoutee/update_job_1' : null
  };
}
