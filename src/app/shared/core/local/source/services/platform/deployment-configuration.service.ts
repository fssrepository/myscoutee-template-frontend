import { Injectable, inject } from '@angular/core';

import {
  type DeploymentConfigurationDto,
  type DeploymentConfigurationServiceContract
} from '../../../../contracts/platform/deployment-configuration.interface';
import { RouteDelayService } from '../../../../base/services/platform/route-delay.service';
import { LocalDeploymentConfigurationRepository } from '../../repositories/platform/deployment-configuration.repository';

const DEPLOYMENT_CONFIGURATION_ROUTE = '/deployment/configuration';

@Injectable({
  providedIn: 'root'
})
export class LocalDeploymentConfigurationService
  implements DeploymentConfigurationServiceContract {
  private readonly repository = inject(LocalDeploymentConfigurationRepository);
  private readonly routeDelay = inject(RouteDelayService);

  async loadBranding(): Promise<DeploymentConfigurationDto> {
    const [, response] = await Promise.all([
      this.routeDelay.waitForRouteDelay(DEPLOYMENT_CONFIGURATION_ROUTE),
      (async (): Promise<DeploymentConfigurationDto> => {
        return this.repository.readPublicConfiguration();
      })()
    ]);
    return response;
  }
}
