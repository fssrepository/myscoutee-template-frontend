import {Injectable,inject} from '@angular/core';
import {BaseRouteModeService} from '../platform/base-route-mode.service';
import {HttpOperatorUpdateService} from '../../../http/services/operator/operator-update.service';
import {LocalOperatorUpdateService} from '../../../local/source/services/operator/operator-update.service';
import type {OperatorDeploymentUpdatePhase,OperatorDeploymentUpdateProgressDto,OperatorDeploymentUpdateProgressHandler,OperatorRollbackDto,OperatorDeploymentUpdateDto} from '../../../contracts/operator/operator-update.interface';
@Injectable({providedIn:'root'})
export class OperatorUpdateService extends BaseRouteModeService {
 private readonly httpService=inject(HttpOperatorUpdateService);
 private readonly localService=inject(LocalOperatorUpdateService);
 private get updateService(){return this.resolveRouteService('/operator/updates',this.localService,this.httpService);}
  loadDeploymentUpdate(): Promise<OperatorDeploymentUpdateDto> {
    return this.updateService.loadDeploymentUpdate();
  }

  applyDeploymentUpdate(
    onProgress?: OperatorDeploymentUpdateProgressHandler
  ): Promise<OperatorDeploymentUpdateDto> {
    return this.updateService.applyDeploymentUpdate(onProgress);
  }

  rollbackDeploymentUpdate(onProgress?: OperatorDeploymentUpdateProgressHandler): Promise<OperatorDeploymentUpdateDto> {
    return this.updateService.rollbackDeploymentUpdate(onProgress);
  }
}
