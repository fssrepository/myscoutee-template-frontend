import type { McpSettingsDto, McpClientRequest, McpClientCreatedDto, McpAuthorizationRequest, McpAuthorizationContext } from '../../../../contracts/integrations/integration.interface';
import { Injectable, inject } from '@angular/core';

import { UserProfileStore } from '../../../../../ui/context/stores/profile/user-profile.store';
import { SessionService } from '../../../../base/services/accounts/session.service';
import type {
  IntegrationSettingsDto,
  IntegrationSettingsUpdateDto,
  IntegrationTokenCreatedDto
} from '../../../../contracts/integrations/integration.interface';
import { LocalIntegrationRepository } from '../../repositories/integrations/integration.repository';
import { LocalDeploymentConfigurationRepository } from '../../repositories/platform/deployment-configuration.repository';
import { LocalRouteDelayService } from '../platform/route-delay.service';

const INTEGRATIONS_ROUTE = '/integrations';

@Injectable({ providedIn: 'root' })
export class LocalIntegrationService extends LocalRouteDelayService {
  private readonly repository = inject(LocalIntegrationRepository);
  private readonly operatorRepository = inject(LocalDeploymentConfigurationRepository);
  private readonly session = inject(SessionService);
  private readonly profile = inject(UserProfileStore);

  async mcpSettings(): Promise<McpSettingsDto> {
    await this.repository.whenReady();
    return this.repository.mcpSettings(this.requireUserId(), new URL('/mcp/private', await this.publicBaseUrl()).toString());
  }
  async createMcpClient(input: McpClientRequest): Promise<McpClientCreatedDto> {
    await this.repository.whenReady();
    const result = this.repository.createMcpClient(this.requireUserId(), input);
    await this.repository.flushToIndexedDb();
    return result;
  }
  async revokeMcpClient(id: string): Promise<void> {
    await this.repository.whenReady();
    this.repository.revokeMcpClient(this.requireUserId(), id);
    await this.repository.flushToIndexedDb();
  }
  mcpAuthorization(_input: McpAuthorizationRequest): Promise<McpAuthorizationContext> { return Promise.reject(new Error('mcp.local.only')); }
  mcpConsent(_input: McpAuthorizationRequest, _approve: boolean, profileId?: string): Promise<{url: string}> { return Promise.reject(new Error('mcp.local.only')); }

  async loadSettings(admin = false): Promise<IntegrationSettingsDto> {
    const owner = this.requireUserId(admin);
    const [, response] = await Promise.all([
      this.waitForRouteDelay(`${INTEGRATIONS_ROUTE}/settings`),
      (async (): Promise<IntegrationSettingsDto> => {
        await this.repository.whenReady();
        const settings = await this.settingsSnapshot(owner, admin);
        await this.repository.flushToIndexedDb();
        return settings;
      })()
    ]);
    return response;
  }

  private async settingsSnapshot(owner: string, admin = false): Promise<IntegrationSettingsDto> {
    const settings = this.repository.settings(owner, admin ? '/api/admin-client/v1' : await this.publicBaseUrl(), admin);
    settings.mcp = this.repository.mcpSettings(owner, new URL('/mcp/private', await this.publicBaseUrl()).toString());
    return settings;
  }

  async saveSettings(request: IntegrationSettingsUpdateDto, admin = false): Promise<IntegrationSettingsDto> {
    const owner = this.requireUserId(admin);
    await this.repository.whenReady();
    await this.waitForRouteDelay(`${INTEGRATIONS_ROUTE}/settings`);
    this.repository.saveAccess(owner, request, admin);
    const settings = await this.settingsSnapshot(owner, admin);
    await this.repository.flushToIndexedDb();
    return settings;
  }

  async createToken(
    name: string,
    expiresInDays: number, admin = false
  ): Promise<IntegrationTokenCreatedDto> {
    return this.withRouteDelay(`${INTEGRATIONS_ROUTE}/tokens`, async (): Promise<IntegrationTokenCreatedDto> => {
      await this.repository.whenReady();
      const created = this.repository.createToken(
        this.requireUserId(admin),
        name,
        expiresInDays, admin
      );
      await this.repository.flushToIndexedDb();
      return created;
    });
  }

  async revokeToken(tokenId: string, admin = false): Promise<void> {
    return this.withRouteDelay(`${INTEGRATIONS_ROUTE}/tokens`, async (): Promise<void> => {
      await this.repository.whenReady();
      this.repository.revokeToken(this.requireUserId(admin), tokenId, admin);
      await this.repository.flushToIndexedDb();
    });
  }

  private requireUserId(admin = false): string {
    const userId = (admin ? this.session.activeUserId() : this.profile.activeUserId()).trim();
    if (!userId) {
      throw new Error('integration.user.missing');
    }
    return userId;
  }

  private async publicBaseUrl(): Promise<string> {
    const configured = (await this.operatorRepository.read())
      ?.configuration.integration?.publicBaseUrl?.trim();
    const fallback = '/api/integrations/v1';
    try {
      return new URL(
        configured || fallback,
        globalThis.location?.origin ?? 'http://localhost'
      ).toString().replace(/\/$/, '');
    } catch {
      return fallback;
    }
  }
}
