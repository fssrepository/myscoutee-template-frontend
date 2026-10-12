import {Injectable,inject} from '@angular/core';
import type {OperatorDeploymentUpdatePhase,OperatorDeploymentUpdateProgressDto,OperatorDeploymentUpdateProgressHandler,OperatorRollbackDto,OperatorDeploymentUpdateDto} from '../../../../contracts/operator/operator-update.interface';
import type {OperatorDeploymentStateRecord} from '../../entity/operator/operator.entity';
import {LocalDeploymentConfigurationRepository} from '../../repositories/platform/deployment-configuration.repository';
import {LocalRoleNotificationsService} from '../notifications/role-notifications.service';
import {LocalRouteDelayService} from '../platform/route-delay.service';
const OPERATOR_UPDATE_ROUTE='/operator/updates';
const OPERATOR_UPDATE_APPLY_ROUTE='/operator/updates/apply';
type LocalUpdateState=OperatorDeploymentStateRecord & {deploymentUpdate:OperatorDeploymentUpdateDto};
@Injectable({providedIn:'root'})
export class LocalOperatorUpdateService extends LocalRouteDelayService {
 private readonly repository=inject(LocalDeploymentConfigurationRepository);
 private readonly roleNotifications=inject(LocalRoleNotificationsService);
 private async readStored():Promise<LocalUpdateState>{
  const stored=await this.repository.read();
  if(!stored?.deploymentUpdate)throw new Error('operator.workspace.error.unavailable');
  return stored as LocalUpdateState;
 }
async loadDeploymentUpdate(): Promise<OperatorDeploymentUpdateDto> {
    const [, response] = await Promise.all([
      this.waitForOperatorRouteDelay(OPERATOR_UPDATE_ROUTE),
      (async (): Promise<OperatorDeploymentUpdateDto> => {
        const update = structuredClone((await this.readStored()).deploymentUpdate);
        if (update.updateAvailable) await this.roleNotifications.publish('release-available', update.availableVersion,
          { releaseVersion: update.availableVersion });
        return update;
      })()
    ]);
    return response;
  }

async applyDeploymentUpdate(
    onProgress?: OperatorDeploymentUpdateProgressHandler
  ): Promise<OperatorDeploymentUpdateDto> {
    await this.waitForOperatorRouteDelay(OPERATOR_UPDATE_APPLY_ROUTE);
    let current = await this.readStored();
    const totalBytes = Math.max(0, current.deploymentUpdate.progress.bytesTotal);
    try {
      const steps: readonly [
        OperatorDeploymentUpdatePhase,
        number,
        number
      ][] = [
        ['CHECKING', 0, 0],
        ['DOWNLOADING', 0, 0],
        ['DOWNLOADING', Math.round(totalBytes * 0.35), 35],
        ['DOWNLOADING', Math.round(totalBytes * 0.78), 78],
        ['DOWNLOADING', totalBytes, 100],
        ['VERIFYING', totalBytes, 100],
        ['INSTALLING', totalBytes, 100]
      ];
      for (const [phase, bytesDownloaded, percent] of steps) {
        current = await this.publishUpdateProgress(
          current,
          {
            phase,
            bytesDownloaded,
            bytesTotal: totalBytes,
            percent,
            message: null,
            updatedAt: new Date().toISOString()
          },
          onProgress
        );
        await this.waitForDelay(70);
      }

      const nowIso = new Date().toISOString();
      const deploymentUpdate: OperatorDeploymentUpdateDto = {
        ...current.deploymentUpdate,
        currentVersion: current.deploymentUpdate.availableVersion,
        updateAvailable: false,
        lastCheckedAt: nowIso,
        lastUpdatedAt: nowIso,
        progress: {
          phase: 'COMPLETED',
          bytesDownloaded: totalBytes,
          bytesTotal: totalBytes,
          percent: 100,
          message: null,
          updatedAt: nowIso
        }
      };
      const completed = {
        ...structuredClone(current),
        deploymentUpdate
      };
      await this.repository.write(completed);
      onProgress?.(structuredClone(deploymentUpdate.progress));
      return structuredClone(deploymentUpdate);
    } catch (error) {
      const failedAt = new Date().toISOString();
      const progress: OperatorDeploymentUpdateProgressDto = {
        ...current.deploymentUpdate.progress,
        phase: 'FAILED',
        message: error instanceof Error ? error.message : 'operator.update.error.failed',
        updatedAt: failedAt
      };
      onProgress?.(structuredClone(progress));
      try {
        await this.repository.write({
          ...structuredClone(current),
          deploymentUpdate: {
            ...current.deploymentUpdate,
            progress
          }
        });
      } catch {
        // The original update error remains authoritative.
      }
      throw error;
    }
  }

async rollbackDeploymentUpdate(_onProgress?: OperatorDeploymentUpdateProgressHandler): Promise<OperatorDeploymentUpdateDto> {
    throw new Error('operator.update.error.rollback.unavailable');
  }

private async waitForOperatorRouteDelay(
    route: string,
    signal?: AbortSignal
  ): Promise<void> {
    await this.waitForRouteDelay(route, signal, 'operator.request.aborted');
  }

private async publishUpdateProgress(
    record: LocalUpdateState,
    progress: OperatorDeploymentUpdateProgressDto,
    onProgress?: OperatorDeploymentUpdateProgressHandler
  ): Promise<LocalUpdateState> {
    const next: LocalUpdateState = {
      ...structuredClone(record),
      deploymentUpdate: {
        ...record.deploymentUpdate,
        progress: structuredClone(progress)
      }
    };
    await this.repository.write(next);
    onProgress?.(structuredClone(progress));
    return next;
  }
}
