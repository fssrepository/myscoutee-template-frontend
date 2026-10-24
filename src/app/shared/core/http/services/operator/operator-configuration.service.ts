import { operatorRequestOptions, requireOperatorResponse } from './operator-request';
const OPERATOR_TLS_CONFIGURATION_ROUTE='/operator/configuration/tls';
const UPDATE_POLL_INTERVAL_MS=750;
import type {OperatorTlsCertificateMode,OperatorTlsTestKind,OperatorTlsJobPhase,OperatorTlsConfigurationDto,OperatorTlsConfigurationUpdateDto,OperatorTlsTestRequestDto,OperatorTlsJobDto} from '../../../contracts/operator/operator.interface';
import {Injectable,inject} from '@angular/core';
import {HttpClient,HttpHeaders,HttpParams} from '@angular/common/http';
import {environment} from '../../../../../../environments/environment';
import {SessionService} from '../../../base/services/accounts/session.service';
import {RouteDelayService} from '../../../base/services/platform/route-delay.service';
import type {OperatorConfigurationDto, OperatorConfigurationSaveRequestDto, OperatorConfigurationTestRequestDto, OperatorConfigurationTestResultDto} from '../../../contracts/operator/operator.interface';
const OPERATOR_CONFIGURATION_ROUTE='/operator/configuration';
@Injectable({providedIn:'root'})
export class HttpOperatorConfigurationService {
 private readonly http=inject(HttpClient);
 private readonly sessionService=inject(SessionService);
 private readonly routeDelay=inject(RouteDelayService);
 private readonly apiBaseUrl=environment.apiBaseUrl??'/api';
  async loadConfiguration(): Promise<OperatorConfigurationDto> {
    return await this.requireResponse(
      OPERATOR_CONFIGURATION_ROUTE,
      this.http.get<OperatorConfigurationDto>(
        `${this.apiBaseUrl}${OPERATOR_CONFIGURATION_ROUTE}`,
        this.requestOptions()
      ).toPromise()
    );
  }

  async saveConfiguration(
    request: OperatorConfigurationSaveRequestDto
  ): Promise<OperatorConfigurationDto> {
    return await this.requireResponse(
      OPERATOR_CONFIGURATION_ROUTE,
      this.http.put<OperatorConfigurationDto>(
        `${this.apiBaseUrl}${OPERATOR_CONFIGURATION_ROUTE}`,
        request,
        this.requestOptions()
      ).toPromise()
    );
  }

  async testConfiguration(
    request: OperatorConfigurationTestRequestDto
  ): Promise<OperatorConfigurationTestResultDto> {
    const destinationToken = request.destinationToken?.trim() ?? '';
    const browserReadinessToken =
      request.browserReadinessToken?.trim() ?? '';
    const browserAppId = request.browserAppId?.trim() ?? '';
    if (destinationToken.length > 4096) {
      throw new Error('operator.configuration.test.messaging.destination.too.long');
    }
    if (
      browserReadinessToken.length > 4096
      || browserAppId.length > 256
    ) {
      throw new Error('operator.configuration.test.failed');
    }
    const payload: OperatorConfigurationTestRequestDto = {
      kind: request.kind,
      ...(request.kind === 'FIREBASE_MESSAGING' && destinationToken
        ? { destinationToken }
        : {}),
      ...(request.kind === 'FIREBASE_MESSAGING' && browserReadinessToken
        ? { browserReadinessToken }
        : {}),
      ...(request.kind === 'FIREBASE_MESSAGING'
        && Number.isSafeInteger(request.browserConfigurationRevision)
        && (request.browserConfigurationRevision ?? -1) >= 0
        ? {
            browserConfigurationRevision:
              request.browserConfigurationRevision
          }
        : {}),
      ...(request.kind === 'FIREBASE_MESSAGING' && browserAppId
        ? { browserAppId }
        : {})
    };
    return await this.requireResponse(
      `${OPERATOR_CONFIGURATION_ROUTE}/tests`,
      this.http.post<OperatorConfigurationTestResultDto>(
        `${this.apiBaseUrl}${OPERATOR_CONFIGURATION_ROUTE}/tests`,
        payload,
        this.requestOptions()
      ).toPromise()
    );
  }

  async activateFirebase(): Promise<OperatorConfigurationDto> {
    return await this.requireResponse(
      `${OPERATOR_CONFIGURATION_ROUTE}/firebase/activate`,
      this.http.post<OperatorConfigurationDto>(
        `${this.apiBaseUrl}${OPERATOR_CONFIGURATION_ROUTE}/firebase/activate`,
        null,
        this.requestOptions()
      ).toPromise()
    );
  }

  private requestOptions(params?: HttpParams): { headers?: HttpHeaders; params?: HttpParams } { return operatorRequestOptions(this.sessionService.currentSession(), params); }

  private async requireResponse<T>(route: string, task: Promise<T | undefined>): Promise<T> { return requireOperatorResponse(this.routeDelay, route, task); }

  async loadTlsConfiguration(): Promise<OperatorTlsConfigurationDto> {
    return await this.requireResponse(
      OPERATOR_TLS_CONFIGURATION_ROUTE,
      this.http.get<OperatorTlsConfigurationDto>(
        `${this.apiBaseUrl}${OPERATOR_TLS_CONFIGURATION_ROUTE}`,
        this.requestOptions()
      ).toPromise()
    );
  }

  async saveTlsConfiguration(
    request: OperatorTlsConfigurationUpdateDto
  ): Promise<OperatorTlsJobDto> {
    const job = await this.requireResponse(
      OPERATOR_TLS_CONFIGURATION_ROUTE,
      this.http.put<OperatorTlsJobDto>(
        `${this.apiBaseUrl}${OPERATOR_TLS_CONFIGURATION_ROUTE}`,
        request,
        this.requestOptions()
      ).toPromise()
    );
    return await this.waitForTlsJob(job);
  }

  async testTlsConfiguration(
    request: OperatorTlsTestRequestDto
  ): Promise<OperatorTlsJobDto> {
    const job = await this.requireResponse(
      OPERATOR_TLS_CONFIGURATION_ROUTE,
      this.http.post<OperatorTlsJobDto>(
        `${this.apiBaseUrl}${OPERATOR_TLS_CONFIGURATION_ROUTE}/tests`,
        request,
        this.requestOptions()
      ).toPromise()
    );
    return await this.waitForTlsJob(job);
  }

  private async waitForTlsJob(
    initial: OperatorTlsJobDto
  ): Promise<OperatorTlsJobDto> {
    let job = initial;
    for (let attempt = 0; attempt < 240; attempt += 1) {
      if (
        job.phase === 'COMPLETED'
        || job.phase === 'FAILED'
        || job.phase === 'REJECTED'
      ) {
        if (job.phase !== 'COMPLETED') {
          throw new Error(job.message || 'operator.configuration.tls.test.failed');
        }
        return job;
      }
      await this.waitForUpdatePoll();
      try {
        job = await this.requireResponse(
          OPERATOR_TLS_CONFIGURATION_ROUTE,
          this.http.get<OperatorTlsJobDto>(
            `${this.apiBaseUrl}${OPERATOR_TLS_CONFIGURATION_ROUTE}/jobs/${
              encodeURIComponent(job.jobId)
            }`,
            this.requestOptions()
          ).toPromise()
        );
      } catch {
        /*
         * Applying TLS recreates Nginx, and the worker briefly owns a request
         * between removing it from the inbox and publishing status. Both are
         * expected transient polling gaps.
         */
      }
    }
    throw new Error('operator.request.timeout');
  }

  private waitForUpdatePoll(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, UPDATE_POLL_INTERVAL_MS));
  }
}
