import type {OperatorTlsCertificateMode,OperatorTlsTestKind,OperatorTlsJobPhase,OperatorTlsConfigurationDto,OperatorTlsConfigurationUpdateDto,OperatorTlsTestRequestDto,OperatorTlsJobDto} from '../../../contracts/operator/operator.interface';
import {Injectable,inject} from '@angular/core';
import {BaseRouteModeService} from '../platform/base-route-mode.service';
import {HttpOperatorConfigurationService} from '../../../http/services/operator/operator-configuration.service';
import {LocalOperatorConfigurationService} from '../../../local/source/services/operator/operator-configuration.service';
import type {OperatorConfigurationDto, OperatorConfigurationSaveRequestDto, OperatorConfigurationTestRequestDto, OperatorConfigurationTestResultDto} from '../../../contracts/operator/operator.interface';
@Injectable({providedIn:'root'})
export class OperatorConfigurationService extends BaseRouteModeService {
 private readonly httpService=inject(HttpOperatorConfigurationService);
 private readonly localService=inject(LocalOperatorConfigurationService);
 private get configurationService(){return this.resolveRouteService('/operator/configuration',this.localService,this.httpService);}
  loadConfiguration(): Promise<OperatorConfigurationDto> {
    return this.configurationService.loadConfiguration();
  }

  saveConfiguration(
    request: OperatorConfigurationSaveRequestDto
  ): Promise<OperatorConfigurationDto> {
    return this.configurationService.saveConfiguration(request);
  }

  testConfiguration(
    request: OperatorConfigurationTestRequestDto
  ): Promise<OperatorConfigurationTestResultDto> {
    return this.configurationService.testConfiguration(request);
  }

  activateFirebase(): Promise<OperatorConfigurationDto> {
    return this.configurationService.activateFirebase();
  }

  loadTlsConfiguration(): Promise<OperatorTlsConfigurationDto> {
    return this.configurationService.loadTlsConfiguration();
  }

  saveTlsConfiguration(
    request: OperatorTlsConfigurationUpdateDto
  ): Promise<OperatorTlsJobDto> {
    return this.configurationService.saveTlsConfiguration(request);
  }

  testTlsConfiguration(
    request: OperatorTlsTestRequestDto
  ): Promise<OperatorTlsJobDto> {
    return this.configurationService.testTlsConfiguration(request);
  }
}
