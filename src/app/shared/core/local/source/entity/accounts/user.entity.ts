import { APP_INDEXED_DB_KEYS } from '../../../../common/storage-scope';
import type { UserDto } from '../../../../contracts/accounts/user.interface';
import type { DeviceRegistrationRecord } from './device-registration.entity';
export const USERS_TABLE_NAME = APP_INDEXED_DB_KEYS.users;
export interface UserRecord extends UserDto {
 integrationTokens?: import('../integrations/integration.entity').LocalIntegrationTokenRecord[];
 integrationAccess?: { revision: number; mcp: import('../../../../contracts/integrations/integration.interface').IntegrationAccessMode; clients: Record<string, import('../../../../contracts/integrations/integration.interface').IntegrationAccessMode>; };
 devices?: DeviceRegistrationRecord[]; status?: string; }
export interface UsersRecordCollection { byId: Record<string, UserRecord>; ids: string[]; }
export type UsersMemorySchema = Record<typeof USERS_TABLE_NAME, UsersRecordCollection>;
