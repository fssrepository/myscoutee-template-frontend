import { HTTP_ADAPTER, LOCAL_ADAPTER, type AdapterInstance } from '../../adapter-loaders';
import { AdapterProxyService } from '../platform/adapter-proxy.service';
import type { McpSettingsDto, McpClientRequest, McpClientCreatedDto, McpAuthorizationRequest, McpAuthorizationContext } from '../../../contracts/integrations/integration.interface';
import { Injectable, inject } from '@angular/core';

import type {
  IntegrationSettingsDto,
  IntegrationSettingsUpdateDto,
  IntegrationTokenCreatedDto
} from '../../../contracts/integrations/integration.interface';
import { BaseRouteModeService } from '../platform/base-route-mode.service';

const INTEGRATIONS_ROUTE = '/integrations';

@Injectable({ providedIn: 'root' })
export class IntegrationService extends BaseRouteModeService {
  private readonly transportAdapters = inject(AdapterProxyService);

  private readonly localService = this.transportAdapters.reference(LOCAL_ADAPTER.INTEGRATION);
  private readonly httpService = this.transportAdapters.reference(HTTP_ADAPTER.INTEGRATION);

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

  private service(admin: boolean): AdapterInstance<typeof LOCAL_ADAPTER.INTEGRATION> | AdapterInstance<typeof HTTP_ADAPTER.INTEGRATION> {
    return this.resolveRouteService(
      admin ? '/admin/client-api' : INTEGRATIONS_ROUTE,
      this.localService,
      this.httpService
    );
  }
}
