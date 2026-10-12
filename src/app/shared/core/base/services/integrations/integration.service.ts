import type { McpSettingsDto, McpClientRequest, McpClientCreatedDto, McpAuthorizationRequest, McpAuthorizationContext } from '../../../contracts/integrations/integration.interface';
import { Injectable, inject } from '@angular/core';

import type {
  IntegrationSettingsDto,
  IntegrationSettingsUpdateDto,
  IntegrationTokenCreatedDto
} from '../../../contracts/integrations/integration.interface';
import { HttpIntegrationService } from '../../../http/services/integrations/integration.service';
import { LocalIntegrationService } from '../../../local/source/services/integrations/integration.service';
import { BaseRouteModeService } from '../platform/base-route-mode.service';

const INTEGRATIONS_ROUTE = '/integrations';

@Injectable({ providedIn: 'root' })
export class IntegrationService extends BaseRouteModeService {
  private readonly localService = inject(LocalIntegrationService);
  private readonly httpService = inject(HttpIntegrationService);

  mcpSettings(): Promise<McpSettingsDto> { return this.service(false).mcpSettings(); }
  createMcpClient(input: McpClientRequest): Promise<McpClientCreatedDto> { return this.service(false).createMcpClient(input); }
  revokeMcpClient(id: string): Promise<void> { return this.service(false).revokeMcpClient(id); }
  mcpAuthorization(input: McpAuthorizationRequest): Promise<McpAuthorizationContext> { return this.service(false).mcpAuthorization(input); }
  mcpConsent(input: McpAuthorizationRequest, approve: boolean, profileId?: string): Promise<{url: string}> { return this.service(false).mcpConsent(input, approve, profileId); }

  loadSettings(admin = false): Promise<IntegrationSettingsDto> {
    return this.service(admin).loadSettings(admin);
  }

  saveSettings(request: IntegrationSettingsUpdateDto, admin = false): Promise<IntegrationSettingsDto> {
    return this.service(admin).saveSettings(request, admin);
  }

  createToken(
    name: string,
    expiresInDays: number, admin = false
  ): Promise<IntegrationTokenCreatedDto> {
    return this.service(admin).createToken(name, expiresInDays, admin);
  }

  revokeToken(tokenId: string, admin = false): Promise<void> {
    return this.service(admin).revokeToken(tokenId, admin);
  }

  absoluteBaseUrl(baseUrl: string): string {
    const normalized = baseUrl.trim();
    if (!normalized) {
      return '';
    }
    try {
      return new URL(
        normalized,
        globalThis.location?.origin ?? 'http://localhost'
      ).toString().replace(/\/$/, '');
    } catch {
      return normalized;
    }
  }

  private service(admin: boolean): LocalIntegrationService | HttpIntegrationService {
    return this.resolveRouteService(
      admin ? '/admin/client-api' : INTEGRATIONS_ROUTE,
      this.localService,
      this.httpService
    );
  }
}
