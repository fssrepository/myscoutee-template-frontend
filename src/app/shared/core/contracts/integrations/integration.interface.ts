export type IntegrationAccessMode = 'blocked' | 'write' | 'read' | 'full';

export interface IntegrationSettingsUpdateDto {
  accessRevision: number;
  mcpAccess: IntegrationAccessMode;
  clients: { id: string; accessMode: IntegrationAccessMode }[];
}

export interface IntegrationTokenDto {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  expiresAt: string;
  claimedAt: string | null;
  claimedAddress: string | null;
  lastUsedAt: string | null;
  accessMode?: IntegrationAccessMode;
}

export interface IntegrationSettingsDto {
  baseUrl: string;
  maxActiveTokens: number;
  maxBatchSize: number;
  tokens: IntegrationTokenDto[];
  mcp?: McpSettingsDto | null;
  accessRevision?: number;
}

export interface IntegrationTokenCreatedDto {
  token: IntegrationTokenDto;
  value: string;
}

export interface McpClientDto { manual?: boolean; clientId?: string; token: IntegrationTokenDto; redirectUri: string; }

export interface McpSettingsDto { resource: string; maxClients: number; remoteEnabled: boolean; clients: McpClientDto[]; accessMode?: IntegrationAccessMode; }

export interface McpClientRequest { name: string; redirectUri?: string; }

export interface McpClientCreatedDto { client: McpClientDto; secret: string; }

export interface McpAuthorizationRequest {
  clientId: string; redirectUri: string; resource: string; scope: string;
  responseType: string; codeChallenge: string; codeChallengeMethod: string; state: string | null;
}

export interface McpAuthorizationContext { profileId: string; clientName: string; profileName: string; groupName: string | null; redirectUri: string; accessMode: IntegrationAccessMode; }
