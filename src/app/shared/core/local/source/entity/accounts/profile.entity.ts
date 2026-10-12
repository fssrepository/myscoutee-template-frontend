import { APP_INDEXED_DB_KEYS } from '../../../../common/storage-scope';
export const CONTACTS_TABLE_NAME = APP_INDEXED_DB_KEYS.contacts;
export interface ContactChatAccessRecord {
 id: string; leftUserId: string; rightUserId: string; requestedBy: string;
 status: 'pending' | 'approved' | 'rejected'; requestedAtIso: string; decidedAtIso: string | null; version: number;
}
export interface ContactsRecordCollection { chatAccessById?: Record<string,ContactChatAccessRecord>; }
export type ContactsMemorySchema = Record<typeof CONTACTS_TABLE_NAME,ContactsRecordCollection>;
