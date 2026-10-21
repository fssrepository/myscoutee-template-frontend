import { HTTP_ADAPTER, LOCAL_ADAPTER } from '../../adapter-loaders';
import { AdapterProxyService } from '../platform/adapter-proxy.service';
import {Injectable,inject} from '@angular/core';
import {BaseRouteModeService} from '../platform/base-route-mode.service';
import type {OperatorDeploymentUpdatePhase,OperatorDeploymentUpdateProgressDto,OperatorDeploymentUpdateProgressHandler,OperatorRollbackDto,OperatorDeploymentUpdateDto} from '../../../contracts/operator/operator-update.interface';
@Injectable({providedIn:'root'})
export class OperatorUpdateService extends BaseRouteModeService {
  private readonly transportAdapters = inject(AdapterProxyService);

 private readonly httpService=this.transportAdapters.reference(HTTP_ADAPTER.OPERATOR_UPDATE);
 private readonly localService=this.transportAdapters.reference(LOCAL_ADAPTER.OPERATOR_UPDATE);
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
