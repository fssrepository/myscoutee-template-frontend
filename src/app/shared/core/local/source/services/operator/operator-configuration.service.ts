import {LocalOperatorTlsMapper} from '../../mappers/operator/operator-tls.mapper';
import type {OperatorTlsCertificateMode,OperatorTlsTestKind,OperatorTlsJobPhase,OperatorTlsConfigurationDto,OperatorTlsConfigurationUpdateDto,OperatorTlsTestRequestDto,OperatorTlsJobDto} from '../../../../contracts/operator/operator.interface';
import {Injectable,inject} from '@angular/core';
import {OperatorConfigurationMapper} from '../../../../base/mappers/operator/operator-configuration.mapper';
import {DEFAULT_DEPLOYMENT_BRANDING} from '../../../../contracts/platform/deployment-configuration.interface';
import type {OperatorConfigurationDto, OperatorConfigurationSaveRequestDto, OperatorConfigurationTestRequestDto, OperatorConfigurationTestResultDto} from '../../../../contracts/operator/operator.interface';
import {LocalDeploymentConfigurationRepository} from '../../repositories/platform/deployment-configuration.repository';
import type {OperatorDeploymentStateRecord} from '../../entity/operator/operator.entity';
import {LocalRouteDelayService} from '../platform/route-delay.service';
const OPERATOR_CONFIGURATION_ROUTE='/operator/configuration';
const OPERATOR_CONFIGURATION_TEST_ROUTE='/operator/configuration/test';
@Injectable({providedIn:'root'})
export class LocalOperatorConfigurationService extends LocalRouteDelayService {
 private readonly repository=inject(LocalDeploymentConfigurationRepository);
 private async readStored():Promise<OperatorDeploymentStateRecord>{
  const stored=await this.repository.read();
  if(!stored)throw new Error('operator.workspace.error.unavailable');
  return stored;
 }
  async loadConfiguration(): Promise<OperatorConfigurationDto> {
    const [, response] = await Promise.all([
      this.waitForOperatorRouteDelay(OPERATOR_CONFIGURATION_ROUTE),
      (async (): Promise<OperatorConfigurationDto> => {
        return structuredClone((await this.readStored()).configuration);
      })()
    ]);
    return response;
  }

  async saveConfiguration(
    request: OperatorConfigurationSaveRequestDto
  ): Promise<OperatorConfigurationDto> {
    await this.waitForOperatorRouteDelay(OPERATOR_CONFIGURATION_ROUTE);
    const current = await this.readStored();
    const adminEmailValidationKey =
      OperatorConfigurationMapper.adminEmailValidationKey(request.adminEmails);
    if (adminEmailValidationKey) {
      throw new Error(adminEmailValidationKey);
    }
    const adminEmails = OperatorConfigurationMapper.adminEmails(
      request.adminEmails
    );
    const privacyContactValidationKey =
      OperatorConfigurationMapper.privacyContactValidationKey(
        request.privacyContact
      );
    if (privacyContactValidationKey) {
      throw new Error(privacyContactValidationKey);
    }
    const privacyContact = OperatorConfigurationMapper.privacyContact(
      request.privacyContact
    );
    const socialLinkValidationKey =
      OperatorConfigurationMapper.socialLinksValidationKey(request.socialLinks);
    if (socialLinkValidationKey) {
      throw new Error(socialLinkValidationKey);
    }
    const socialLinks = OperatorConfigurationMapper.socialLinks(
      request.socialLinks
    );
    const integrationValidationKey =
      OperatorConfigurationMapper.integrationValidationKey(
        request.integration
      );
    if (request.integration && integrationValidationKey) {
      throw new Error(integrationValidationKey);
    }
    const integrationPublicBaseUrl = request.integration
      ? OperatorConfigurationMapper.publicBaseUrl(
          request.integration.publicBaseUrl
        )
      : current.configuration.integration?.publicBaseUrl ?? null;
    const productName = `${request.branding.productName ?? ''}`.trim().slice(0, 80);
    const logoUrl = `${request.branding.logoUrl ?? ''}`.trim();
    if (!productName) {
      throw new Error('operator.configuration.branding.label.required');
    }
    const logoCharacterIndex =
      request.branding.logoCharacterIndex
      ?? DEFAULT_DEPLOYMENT_BRANDING.logoCharacterIndex;
    if (
      logoCharacterIndex !== null
      && (
        !Number.isInteger(logoCharacterIndex)
        || logoCharacterIndex < -1
        || logoCharacterIndex >= Array.from(productName).length
      )
    ) {
      throw new Error('operator.configuration.branding.logo.character.index.invalid');
    }
    const projectId = `${request.firebase.projectId ?? ''}`.trim().slice(0, 160);
    const authenticationCredentialConfigured =
      Boolean(`${request.firebase.authenticationCredential ?? ''}`.trim())
      || current.configuration.firebase.authenticationCredentialConfigured;
    const messagingCredentialConfigured =
      Boolean(`${request.firebase.messagingCredential ?? ''}`.trim())
      || current.configuration.firebase.messagingCredentialConfigured;
    const publicConfigurationFields = {
      apiKey: `${request.firebase.apiKey ?? ''}`.trim().slice(0, 256),
      authDomain: `${request.firebase.authDomain ?? ''}`.trim().slice(0, 253),
      projectId,
      storageBucket: `${request.firebase.storageBucket ?? ''}`.trim().slice(0, 512),
      messagingSenderId:
        `${request.firebase.messagingSenderId ?? ''}`.trim().slice(0, 64),
      appId: `${request.firebase.appId ?? ''}`.trim().slice(0, 256),
      measurementId:
        `${request.firebase.measurementId ?? ''}`.trim().slice(0, 64) || null,
      vapidKey: `${request.firebase.vapidKey ?? ''}`.trim().slice(0, 512) || null
    };
    const currentPublicConfiguration =
      current.configuration.firebase.publicConfiguration;
    const currentPublicConfigurationFields = {
      apiKey: currentPublicConfiguration.apiKey,
      authDomain: currentPublicConfiguration.authDomain,
      projectId: currentPublicConfiguration.projectId,
      storageBucket: currentPublicConfiguration.storageBucket,
      messagingSenderId: currentPublicConfiguration.messagingSenderId,
      appId: currentPublicConfiguration.appId,
      measurementId: currentPublicConfiguration.measurementId,
      vapidKey: currentPublicConfiguration.vapidKey
    };
    const firebaseChanged =
      projectId !== current.configuration.firebase.projectId
      || JSON.stringify(publicConfigurationFields)
        !== JSON.stringify(currentPublicConfigurationFields)
      || Boolean(`${request.firebase.authenticationCredential ?? ''}`.trim())
      || Boolean(`${request.firebase.messagingCredential ?? ''}`.trim());
    if (
      firebaseChanged
      && current.configuration.firebase.publicConfiguration.revision
        >= Number.MAX_SAFE_INTEGER
    ) {
      throw new Error('operator.request.failed');
    }
    const publicConfiguration = {
      revision: firebaseChanged
        ? current.configuration.firebase.publicConfiguration.revision + 1
        : current.configuration.firebase.publicConfiguration.revision,
      ...publicConfigurationFields
    };
    const updatedAt = new Date().toISOString();
    const configuration: OperatorConfigurationDto = {
      capability: 'AVAILABLE',
      unavailableReason: null,
      adminEmails,
      privacyContact,
      socialLinks,
      branding: {
        productName,
        homeLabel: current.configuration.branding.homeLabel,
        logoUrl,
        logoCharacterIndex,
        revision: current.configuration.branding.revision + 1
      },
      integration: {
        publicBaseUrl: integrationPublicBaseUrl
      },
      firebase: {
        projectId,
        authenticationCredentialConfigured,
        messagingCredentialConfigured,
        publicConfiguration,
        active: firebaseChanged
          ? false
          : current.configuration.firebase.active,
        readyToActivate: firebaseChanged
          ? false
          : current.configuration.firebase.readyToActivate,
        authenticationTestedAt: firebaseChanged
          ? null
          : current.configuration.firebase.authenticationTestedAt,
        messagingTestedAt: firebaseChanged
          ? null
          : current.configuration.firebase.messagingTestedAt,
        activatedAt: firebaseChanged
          ? null
          : current.configuration.firebase.activatedAt
      },
      updatedAt
    };
    await this.repository.write({
      ...structuredClone(current),
      configuration
    });
    return structuredClone(configuration);
  }

  async testConfiguration(
    request: OperatorConfigurationTestRequestDto
  ): Promise<OperatorConfigurationTestResultDto> {
    await this.waitForOperatorRouteDelay(OPERATOR_CONFIGURATION_TEST_ROUTE);
    const current = await this.readStored();
    const configured = request.kind === 'FIREBASE_AUTHENTICATION'
      ? Boolean(
          current.configuration.firebase.projectId.trim()
          && current.configuration.firebase.authenticationCredentialConfigured
        )
      : Boolean(
          current.configuration.firebase.projectId.trim()
          && current.configuration.firebase.messagingCredentialConfigured
          && request.browserReadinessToken?.trim()
          && request.browserConfigurationRevision
            === current.configuration.firebase.publicConfiguration.revision
          && request.browserAppId?.trim()
            === current.configuration.firebase.publicConfiguration.appId.trim()
        );
    const testedAt = new Date().toISOString();
    const firebase = structuredClone(current.configuration.firebase);
    if (request.kind === 'FIREBASE_AUTHENTICATION') {
      firebase.authenticationTestedAt = configured ? testedAt : null;
    }
    if (request.kind === 'FIREBASE_MESSAGING') {
      firebase.messagingTestedAt = configured ? testedAt : null;
    }
    if (!configured) {
      firebase.active = false;
      firebase.activatedAt = null;
    }
    firebase.readyToActivate = Boolean(
      firebase.authenticationTestedAt
      && firebase.messagingTestedAt
      && firebase.authenticationCredentialConfigured
      && firebase.messagingCredentialConfigured
      && firebase.publicConfiguration.apiKey.trim()
      && firebase.publicConfiguration.authDomain.trim()
      && firebase.publicConfiguration.projectId.trim()
      && firebase.publicConfiguration.messagingSenderId.trim()
      && firebase.publicConfiguration.appId.trim()
      && firebase.publicConfiguration.vapidKey?.trim()
    );
    await this.repository.write({
      ...structuredClone(current),
      configuration: {
        ...structuredClone(current.configuration),
        firebase,
        updatedAt: testedAt
      }
    });
    return {
      kind: request.kind,
      success: configured,
      message: configured
        ? 'operator.configuration.test.success'
        : 'operator.configuration.test.failed',
      testedAt,
      firebase: structuredClone(firebase)
    };
  }

  async activateFirebase(): Promise<OperatorConfigurationDto> {
    await this.waitForOperatorRouteDelay(
      `${OPERATOR_CONFIGURATION_ROUTE}/firebase/activate`
    );
    const current = await this.readStored();
    if (!current.configuration.firebase.readyToActivate) {
      throw new Error('operator.configuration.firebase.activation.not.ready');
    }
    const activatedAt = new Date().toISOString();
    const configuration: OperatorConfigurationDto = {
      ...structuredClone(current.configuration),
      firebase: {
        ...structuredClone(current.configuration.firebase),
        active: true,
        activatedAt
      },
      updatedAt: activatedAt
    };
    await this.repository.write({
      ...structuredClone(current),
      configuration
    });
    return structuredClone(configuration);
  }

  private async waitForOperatorRouteDelay(
    route: string,
    signal?: AbortSignal
  ): Promise<void> {
    await this.waitForRouteDelay(route, signal, 'operator.request.aborted');
  }

  async loadTlsConfiguration(): Promise<OperatorTlsConfigurationDto> {
    const [, response] = await Promise.all([
      this.waitForOperatorRouteDelay(OPERATOR_CONFIGURATION_ROUTE),
      (async (): Promise<OperatorTlsConfigurationDto> => {
        const current = await this.readStored();
        return LocalOperatorTlsMapper.configuration(current.tlsConfiguration);
      })()
    ]);
    return response;
  }

  async saveTlsConfiguration(
    request: OperatorTlsConfigurationUpdateDto
  ): Promise<OperatorTlsJobDto> {
    await this.waitForOperatorRouteDelay(OPERATOR_CONFIGURATION_ROUTE);
    const updatedAt = new Date().toISOString();
    const current = await this.readStored();
    const tlsConfiguration = LocalOperatorTlsMapper.updated(
      current.tlsConfiguration,
      request,
      updatedAt
    );
    await this.repository.write({
      ...structuredClone(current),
      tlsConfiguration
    });
    return {
      jobId: this.createToken('tls'),
      phase: 'COMPLETED',
      percent: 100,
      message: 'operator.configuration.tls.saved',
      updatedAt,
      configuration: structuredClone(tlsConfiguration)
    };
  }

  async testTlsConfiguration(
    request: OperatorTlsTestRequestDto
  ): Promise<OperatorTlsJobDto> {
    await this.waitForOperatorRouteDelay(OPERATOR_CONFIGURATION_TEST_ROUTE);
    const updatedAt = new Date().toISOString();
    const configured = request.kind === 'DOMAIN'
      ? Boolean(request.configuration.domain.trim())
      : request.configuration.mode === 'AUTOMATIC'
        || Boolean(
          request.configuration.certificate.trim()
          && request.configuration.privateKey.trim()
        )
        || LocalOperatorTlsMapper.configuration(
          (await this.readStored()).tlsConfiguration
        ).certificateConfigured;
    if (!configured) {
      throw new Error(
        request.kind === 'DOMAIN'
          ? 'operator.configuration.tls.domain.invalid'
          : 'operator.configuration.tls.certificate.required'
      );
    }
    return {
      jobId: this.createToken('tls'),
      phase: 'COMPLETED',
      percent: 100,
      message: request.kind === 'DOMAIN'
        ? 'operator.configuration.tls.test.domain.success'
        : 'operator.configuration.tls.test.certificate.success',
      updatedAt,
      configuration: null
    };
  }

  private createToken(prefix: string): string {
    const random = globalThis.crypto?.randomUUID?.().replaceAll('-', '')
      ?? `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    return `${prefix}_${random}`;
  }
}
