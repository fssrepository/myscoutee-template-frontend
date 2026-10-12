import type { McpSettingsDto, McpClientRequest, McpClientCreatedDto } from '../../../../contracts/integrations/integration.interface';
import { Injectable, inject } from '@angular/core';

import { LocalMemoryDb } from '../../../../common/app.db';
import type {
  IntegrationSettingsDto,
  IntegrationSettingsUpdateDto,
  IntegrationTokenCreatedDto
} from '../../../../contracts/integrations/integration.interface';
import type { LocalIntegrationTokenRecord } from '../../entity/integrations/integration.entity';
import { USERS_TABLE_NAME, type UserRecord } from '../../entity/accounts/user.entity';
import { secureRandomUuid } from '../../../../common/secure-random';

@Injectable({ providedIn: 'root' })
export class LocalIntegrationRepository {
  private static readonly MAX_ACTIVE_TOKENS = 3;
  private static readonly MAX_BATCH_SIZE = 1000;
  private readonly memoryDb = inject(LocalMemoryDb);

  whenReady(): Promise<void> {
    return this.memoryDb.whenReady();
  }

  flushToIndexedDb(): Promise<void> {
    return this.memoryDb.flushToIndexedDb();
  }

  settings(userId: string, baseUrl: string, admin = false): IntegrationSettingsDto {
    let user = this.requireUser(userId);
    if (admin && !user.admin) throw new Error('admin.api.denied');
    return {
      baseUrl,
      maxActiveTokens: LocalIntegrationRepository.MAX_ACTIVE_TOKENS,
      maxBatchSize: LocalIntegrationRepository.MAX_BATCH_SIZE,
      tokens: this.activeTokens(this.requireUser(userId), admin).map(({ value: _value, ...token }) => ({
        ...token, accessMode: user.integrationAccess?.clients[token.id] ?? 'write'
      })),
      accessRevision: user.integrationAccess?.revision ?? 0
    };
  }

  mcpSettings(userId: string, resource: string): McpSettingsDto {
    const access = this.requireUser(userId).integrationAccess;
    return {resource, maxClients: LocalIntegrationRepository.MAX_ACTIVE_TOKENS, remoteEnabled: false,
      accessMode: access?.mcp ?? 'blocked',
      clients: this.activeTokens(this.requireUser(userId), false, 'mcp').map(({value: _secret, redirectUri, ...token}) =>
        ({token: {...token, accessMode: access?.clients[token.id] ?? 'write'}, redirectUri: redirectUri ?? '', manual: true, clientId: token.id}))};
  }

  saveAccess(userId: string, request: IntegrationSettingsUpdateDto, admin = false): void {
    const user = this.requireUser(userId);
    const modes = ['blocked', 'write', 'read', 'full'];
    if (!request || !Number.isInteger(request.accessRevision) || request.accessRevision < 0
      || !modes.includes(request.mcpAccess) || !Array.isArray(request.clients)
      || request.clients.length > 2 * LocalIntegrationRepository.MAX_ACTIVE_TOKENS) throw new Error('integration.access.invalid');
    if (request.accessRevision !== (user.integrationAccess?.revision ?? 0)) throw new Error('integration.access.conflict');
    const active = [...this.activeTokens(user, admin), ...this.activeTokens(user, false, 'mcp')];
    const ids = new Set(active.map(token => token.id));
    const clients = {...user.integrationAccess?.clients, ...Object.fromEntries(active.map(token => [token.id, user.integrationAccess?.clients[token.id] ?? 'write']))};
    const changed = new Set<string>();
    for (const client of request.clients) {
      if (!client || !client.id || !modes.includes(client.accessMode) || changed.has(client.id)) throw new Error('integration.access.invalid');
      if (!ids.has(client.id)) throw new Error('integration.access.conflict');
      changed.add(client.id);
      clients[client.id] = client.accessMode;
    }
    this.memoryDb.write(state => ({...state, [USERS_TABLE_NAME]: {...state[USERS_TABLE_NAME], byId: {
      ...state[USERS_TABLE_NAME].byId,
      [userId]: {...state[USERS_TABLE_NAME].byId[userId], integrationAccess: {
        revision: request.accessRevision + 1, mcp: request.mcpAccess, clients
      }}
    }}}));
  }
  createMcpClient(userId: string, input: McpClientRequest): McpClientCreatedDto {
    if (!input.name.trim() || input.name.length > 80) throw new Error('mcp.failed');
    const redirectUri = input.redirectUri ?? '';
    if (redirectUri) {
      let uri: URL;
      try { uri = new URL(redirectUri); } catch { throw new Error('mcp.failed'); }
      if (redirectUri.length > 2048 || uri.username || uri.password
        || redirectUri !== redirectUri.trim() || redirectUri.includes('#') || redirectUri.includes('*') || !(uri.protocol === 'https:'
          || (uri.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(uri.hostname)))) throw new Error('mcp.failed');
    }
    const created = this.createToken(userId, input.name, 90, false, 'mcp', redirectUri);
    return {client: {token: created.token, redirectUri, manual: true, clientId: created.token.id}, secret: created.value};
  }
  revokeMcpClient(userId: string, id: string): void { this.revokeToken(userId, id, false, 'mcp'); }

  createToken(
    userId: string,
    name: string,
    expiresInDays: number, admin = false, scope?: 'mcp', redirectUri?: string
  ): IntegrationTokenCreatedDto {
    const user = this.requireUser(userId);
    if (admin && !user.admin) throw new Error('admin.api.denied');
    const activeTokens = this.activeTokens(user, admin, scope);
    if (activeTokens.length >= LocalIntegrationRepository.MAX_ACTIVE_TOKENS) {
      throw new Error('integration.token.limit.reached');
    }
    const normalizedName = name.trim();
    if (!normalizedName) {
      throw new Error('integration.token.name.required');
    }
    const days = Math.max(1, Math.min(365, Math.trunc(expiresInDays)));
    const now = new Date();
    const id = this.uuid();
    const value = `msc_${id.replaceAll('-', '')}_${this.uuid().replaceAll('-', '')}`;
    const record: LocalIntegrationTokenRecord = {
      id, scope: scope ?? (admin ? 'admin-client' : 'integration'), redirectUri,
      name: normalizedName,
      prefix: value.slice(0, 12),
      value,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString(),
      claimedAt: null,
      claimedAddress: null,
      lastUsedAt: null
    };
    this.writeTokens(user.id, [...(user.integrationTokens ?? []), record]);
    const { value: _storedValue, redirectUri: _redirectUri, ...token } = record;
    return { token, value };
  }

  revokeToken(userId: string, tokenId: string, admin = false, scope?: 'mcp'): void {
    const user = this.requireUser(userId);
    if (admin && !user.admin) throw new Error('admin.api.denied');
    const normalizedId = tokenId.trim();
    this.writeTokens(
      user.id,
      (user.integrationTokens ?? []).filter(token => token.id !== normalizedId || (token.scope ?? 'integration') !== (scope ?? (admin ? 'admin-client' : 'integration')))
    );
  }

  private activeTokens(user: UserRecord, admin = false, scope?: 'mcp'): LocalIntegrationTokenRecord[] {
    const now = Date.now();
    return (user.integrationTokens ?? [])
      .filter(token => Date.parse(token.expiresAt) > now && (token.scope ?? 'integration') === (scope ?? (admin ? 'admin-client' : 'integration')))
      .map(token => ({ ...token }));
  }

  private writeTokens(
    userId: string,
    integrationTokens: LocalIntegrationTokenRecord[]
  ): void {
    this.memoryDb.write(state => {
      const table = state[USERS_TABLE_NAME];
      const user = table.byId[userId];
      if (!user) {
        throw new Error('integration.user.missing');
      }
      return {
        ...state,
        [USERS_TABLE_NAME]: {
          ...table,
          byId: {
            ...table.byId,
            [userId]: {
              ...user,
              integrationTokens: integrationTokens.map(token => ({ ...token }))
            }
          }
        }
      };
    });
  }

  private requireUser(userId: string): UserRecord {
    const normalizedId = userId.trim();
    const user = this.memoryDb.read()[USERS_TABLE_NAME].byId[normalizedId];
    if (!user) {
      throw new Error('integration.user.missing');
    }
    return user;
  }

  private uuid(): string {
    return secureRandomUuid();
  }
}
