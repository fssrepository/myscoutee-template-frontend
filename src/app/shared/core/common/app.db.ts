import { NOTIFICATIONS_TABLE_NAME } from '../local/source/entity/notifications/notification.entity';
import { CHATS_TABLE_NAME, CHAT_MESSAGES_TABLE_NAME } from '../local/source/entity/chat/chat.entity';
import { CONTACTS_TABLE_NAME } from '../local/source/entity/accounts/profile.entity';
import { SAMPLE_CARDS_TABLE_NAME } from '../local/source/entity/showcase/showcase.entity';
import { HELP_CENTER_TABLE_NAME } from '../local/source/entity/content/content.entity';
import { Injectable,signal } from '@angular/core';
import { USERS_TABLE_NAME } from '../local/source/entity/accounts/user.entity';
import type { AppMemorySchema } from '../local/common/memory.schema';
import { type AppStorageScope,APP_STORAGE_SCOPE,APP_SCOPED_INDEXED_DB_VERSION,APP_I18N_BUNDLES_STORE,APP_TABLES_STORE,appMemoryDbStorageKey,appScopedIndexedDbName,createAppScopedObjectStores,removeScopedStorageEntries } from './storage-scope';

@Injectable({ providedIn: 'root' })
export class AppMemoryDb {
  private static readonly SCHEMA_TABLE_KEYS=[NOTIFICATIONS_TABLE_NAME, USERS_TABLE_NAME, HELP_CENTER_TABLE_NAME, SAMPLE_CARDS_TABLE_NAME, CHATS_TABLE_NAME, CHAT_MESSAGES_TABLE_NAME, CONTACTS_TABLE_NAME] as const;
  private readonly _tables=signal<AppMemorySchema>(this.loadInitialState());

  private pendingPersistState: AppMemorySchema|null=null;

  private persistTimerId: ReturnType<typeof setTimeout>|null=null;

  private resetStoragePromise: Promise<void>|null=null;

  private storageResetComplete=false;

  private hydrationComplete=false;

  private readonly hydrationReady: Promise<void>;

  protected get storageScope(): AppStorageScope {
    return APP_STORAGE_SCOPE;
  }

  protected get storageEnabled(): boolean {
    return this.storageScope===APP_STORAGE_SCOPE;
  }

  readonly tables=this._tables.asReadonly();

  constructor() {
    this.hydrationReady=this.storageEnabled
      ? this.hydrateFromIndexedDb()
      :this.completeInactiveHydration();
  }

  read(): AppMemorySchema {
    return this._tables();
  }

  async whenReady(): Promise<void> {
    try {
      await this.hydrationReady;
    } catch {
      // Keep callers unblocked if IndexedDB hydration fails.
    }
  }

  async flushToIndexedDb(): Promise<void> {
    await this.whenReady();
    if(this.persistTimerId!==null) {
      clearTimeout(this.persistTimerId);
      this.persistTimerId=null;
    }
    const pendingState=this.pendingPersistState??this._tables();
    this.pendingPersistState=null;
    if(this.storageEnabled) {
      this.persist(pendingState);
    }
    await this.persistToIndexedDb(pendingState,true);
  }

  async resetStorage(): Promise<void> {
    await this.resetStoragePreservingTables([]);
  }

  async resetStoragePreservingTables(preservedTableNames: readonly string[]): Promise<void> {
    await this.whenReady();
    const preservedTableNameSet=new Set(preservedTableNames.map(tableName => tableName.trim()).filter(Boolean));
    const fullReset=preservedTableNameSet.size===0;
    const currentState=this._tables();
    const nextState=this.createEmptyState();
    for(const tableName of AppMemoryDb.SCHEMA_TABLE_KEYS) {
      if(preservedTableNameSet.has(tableName)) {
        (nextState as unknown as Record<string, unknown>)[tableName] = currentState[tableName];
      }
    }

    if(this.persistTimerId!==null) {
      clearTimeout(this.persistTimerId);
      this.persistTimerId=null;
    }
    this.pendingPersistState=null;
    this._tables.set(nextState);

    if(typeof localStorage!=='undefined') {
      try {
        if(fullReset) {
          removeScopedStorageEntries(localStorage,this.storageScope);
        } else {
          localStorage.removeItem(this.storageKey);
        }
      } catch {
        // A blocked localStorage should not break demo bootstrap.
      }
    }
    if(fullReset&&typeof sessionStorage!=='undefined') {
      try {
        removeScopedStorageEntries(sessionStorage,this.storageScope);
      } catch {
        // A blocked sessionStorage should not break demo bootstrap.
      }
    }

    const db=await this.openIndexedDb(true);
    if(!db) {
      return;
    }
    await new Promise<void>(resolve => {
      const tx=db.transaction(APP_TABLES_STORE,'readwrite');
      tx.objectStore(APP_TABLES_STORE).clear();
      tx.oncomplete=() => resolve();
      tx.onerror=() => resolve();
      tx.onabort=() => resolve();
    });
    if(fullReset&&db.objectStoreNames.contains(APP_I18N_BUNDLES_STORE)) {
      await new Promise<void>(resolve => {
        const tx=db.transaction(APP_I18N_BUNDLES_STORE,'readwrite');
        tx.objectStore(APP_I18N_BUNDLES_STORE).clear();
        tx.oncomplete=() => resolve();
        tx.onerror=() => resolve();
        tx.onabort=() => resolve();
      });
    }
  }

  async resetStorageOnce(): Promise<void> {
    if(this.storageResetComplete) {
      return;
    }
    if(!this.resetStoragePromise) {
      this.resetStoragePromise=this.resetStorage()
        .finally(() => {
          this.storageResetComplete=true;
          this.resetStoragePromise=null;
        });
    }
    await this.resetStoragePromise;
  }

  async readIndexedDbTableEntry<T=unknown>(key: string): Promise<T|null> {
    const normalizedKey=key.trim();
    if(!normalizedKey) {
      return null;
    }
    const db=await this.openIndexedDb(true);
    if(!db) {
      return null;
    }
    return await this.readIndexedDbEntry(db,normalizedKey) as T|null;
  }

  async writeIndexedDbTableEntry(key: string,value: unknown): Promise<void> {
    const normalizedKey=key.trim();
    if(!normalizedKey) {
      return;
    }
    const db=await this.openIndexedDb(true);
    if(!db) {
      return;
    }
    await this.putIndexedDbEntry(db,normalizedKey,this.indexedDbEntryForPersistence(normalizedKey,value));
  }

  async updateIndexedDbTableEntry<T>(key: string,update: (value: T|null) => T): Promise<T> {
    const db=await this.openIndexedDb(true);
    if(!db) throw new Error('IndexedDB unavailable');
    return new Promise<T>((resolve,reject) => {
      const transaction=db.transaction(APP_TABLES_STORE,'readwrite');
      const table=transaction.objectStore(APP_TABLES_STORE);
      const request=table.get(key);
      let next: T;
      request.onsuccess=() => {
        try { next=update((request.result??null) as T|null); table.put(next,key); }
        catch(error) { transaction.abort(); reject(error); }
      };
      transaction.oncomplete=() => resolve(next!);
      transaction.onerror=() => reject(transaction.error);
      transaction.onabort=() => reject(transaction.error??new Error('IndexedDB transaction aborted'));
    });
  }

  async deleteIndexedDbTableEntry(key: string): Promise<void> {
    const normalizedKey=key.trim();
    if(!normalizedKey) {
      return;
    }
    const db=await this.openIndexedDb(true);
    if(!db) {
      return;
    }
    await new Promise<void>(resolve => {
      const tx=db.transaction(APP_TABLES_STORE,'readwrite');
      tx.objectStore(APP_TABLES_STORE).delete(normalizedKey);
      tx.oncomplete=() => resolve();
      tx.onerror=() => resolve();
      tx.onabort=() => resolve();
    });
  }

  private loadInitialState(): AppMemorySchema {
    const fallback=this.createEmptyState();
    if(!this.canUseStorage()) {
      return fallback;
    }
    try {
      const raw=localStorage.getItem(this.storageKey);
      if(!raw) {
        return fallback;
      }
      const parsed=JSON.parse(raw) as unknown;
      return this.normalizeState(parsed,fallback);
    } catch {
      return fallback;
    }
  }

  private persist(state: AppMemorySchema): void {
    if(!this.canUseStorage()) {
      return;
    }
    try {
      localStorage.setItem(this.storageKey,JSON.stringify(this.stateForLocalStoragePersistence(state)));
    } catch {
      // Ignore quota/private-mode write failures in demo mode.
    }
  }

  private schedulePersist(state: AppMemorySchema): void {
    this.pendingPersistState=state;
    if(this.persistTimerId!==null) {
      clearTimeout(this.persistTimerId);
    }
    this.persistTimerId=setTimeout(() => {
      this.persistTimerId=null;
      const pendingState=this.pendingPersistState;
      this.pendingPersistState=null;
      if(!pendingState) {
        return;
      }
      this.persist(pendingState);
      void this.persistToIndexedDb(pendingState);
    },32);
  }

  private async completeInactiveHydration(): Promise<void> {
    this.hydrationComplete=true;
  }

  private async hydrateFromIndexedDb(): Promise<void> {
    try {
      const snapshot=await this.readFromIndexedDb();
      if(!snapshot) {
        return;
      }
      const normalized=this.normalizeState(snapshot);
      const current=this._tables();
      const currentHasUsers=current[USERS_TABLE_NAME].ids.length>0;
      const incomingHasUsers=normalized[USERS_TABLE_NAME].ids.length>0;
      if(currentHasUsers&&!incomingHasUsers) {
        return;
      }
      this._tables.set(normalized);
    } finally {
      if(this.persistTimerId!==null) {
        clearTimeout(this.persistTimerId);
        this.persistTimerId=null;
      }
      this.pendingPersistState=null;
      this.hydrationComplete=true;
    }
  }

  private async readFromIndexedDb(): Promise<AppMemorySchema|null> {
    const primaryDb=await this.openIndexedDb();
    if(primaryDb) {
      const primarySnapshot=await this.readStateFromIndexedDb(primaryDb);
      if(primarySnapshot) {
        return primarySnapshot;
      }
    }
    return null;
  }

  private async readStateFromIndexedDb(db: IDBDatabase): Promise<AppMemorySchema|null> {
    const partialState: Record<string,unknown>={};
    let hasStoredTable=false;
    await Promise.all(AppMemoryDb.SCHEMA_TABLE_KEYS.map(async key => {
      const entry=await this.readIndexedDbEntry(db,key);
      if(entry===null) {
        return;
      }
      partialState[key]=entry;
      hasStoredTable=true;
    }));

    if(!hasStoredTable) {
      return null;
    }

    return this.normalizeState(partialState);
  }

  private async persistToIndexedDb(state: AppMemorySchema,force=false): Promise<void> {
    const db=await this.openIndexedDb(force);
    if(!db) {
      return;
    }
    const persistedState=this.stateForIndexedDbPersistence(state);
    await Promise.all(AppMemoryDb.SCHEMA_TABLE_KEYS.map(key => {
      const value=this.indexedDbEntryForPersistence(key,persistedState[key]);
      return this.shouldPersistIndexedDbTable(key,value)
        ? this.putIndexedDbEntry(db,key,value)
        :this.deleteIndexedDbEntry(db,key);
    }));
  }

  private indexedDbPlainValue(value: unknown): unknown {
    return this.toIndexedDbPlainValue(value,new WeakSet<object>());
  }

  private hasEntries(value: unknown): boolean {
    return Array.isArray(value)&&value.length>0;
  }

  private toIndexedDbPlainValue(value: unknown,seen: WeakSet<object>): unknown {
    if(
      value===null
      ||typeof value==='string'
      ||typeof value==='number'
      ||typeof value==='boolean'
    ) {
      return value;
    }
    if(value===undefined||typeof value==='function'||typeof value==='symbol') {
      return null;
    }
    if(typeof value==='bigint') {
      return value.toString();
    }
    if(value instanceof Date) {
      return value.toISOString();
    }
    if(typeof Blob!=='undefined'&&value instanceof Blob) {
      return value;
    }
    if(Array.isArray(value)) {
      return value.map(item => this.toIndexedDbPlainValue(item,seen));
    }
    if(typeof value!=='object') {
      return null;
    }
    if(seen.has(value)) {
      return null;
    }
    seen.add(value);
    const next: Record<string,unknown>={};
    for(const [key,entry] of Object.entries(value as Record<string,unknown>)) {
      if(entry===undefined||typeof entry==='function'||typeof entry==='symbol') {
        continue;
      }
      next[key]=this.toIndexedDbPlainValue(entry,seen);
    }
    seen.delete(value);
    return next;
  }

  private stateForIndexedDbPersistence(state: AppMemorySchema): AppMemorySchema {
    return state;
  }

  private readIndexedDbEntry(db: IDBDatabase,key: string): Promise<unknown|null> {
    return new Promise<unknown|null>(resolve => {
      const tx=db.transaction(APP_TABLES_STORE,'readonly');
      const store=tx.objectStore(APP_TABLES_STORE);
      const request=store.get(key);
      request.onsuccess=() => resolve(request.result??null);
      request.onerror=() => resolve(null);
    });
  }

  private putIndexedDbEntry(db: IDBDatabase,key: string,value: unknown): Promise<void> {
    return new Promise<void>(resolve => {
      const tx=db.transaction(APP_TABLES_STORE,'readwrite');
      tx.objectStore(APP_TABLES_STORE).put(value,key);
      tx.oncomplete=() => resolve();
      tx.onerror=() => resolve();
      tx.onabort=() => resolve();
    });
  }

  private deleteIndexedDbEntry(db: IDBDatabase,key: string): Promise<void> {
    return new Promise<void>(resolve => {
      const tx=db.transaction(APP_TABLES_STORE,'readwrite');
      tx.objectStore(APP_TABLES_STORE).delete(key);
      tx.oncomplete=() => resolve();
      tx.onerror=() => resolve();
      tx.onabort=() => resolve();
    });
  }

  private openIndexedDb(force=false): Promise<IDBDatabase|null> {
    if((!force&&!this.storageEnabled)||typeof indexedDB==='undefined') {
      return Promise.resolve(null);
    }
    return new Promise<IDBDatabase|null>(resolve => {
      const request=indexedDB.open(this.indexedDbName,APP_SCOPED_INDEXED_DB_VERSION);
      request.onupgradeneeded=() => {
        const db=request.result;
        createAppScopedObjectStores(db);
      };
      request.onsuccess=() => resolve(request.result);
      request.onerror=() => resolve(null);
      request.onblocked=() => resolve(null);
    });
  }

  private canUseStorage(): boolean {
    return this.storageEnabled&&typeof localStorage!=='undefined';
  }

  private get storageKey(): string {
    return appMemoryDbStorageKey(this.storageScope);
  }

  private get indexedDbName(): string {
    return appScopedIndexedDbName(this.storageScope);
  }
  write(updater: (current: AppMemorySchema) => AppMemorySchema): void {
    const next=this.normalizeState(updater(this._tables()));
    this._tables.set(next);
    if(this.hydrationComplete&&this.storageEnabled) this.schedulePersist(next);
  }
    private mergeHydratedStateWithCurrent(incoming: AppMemorySchema, current: AppMemorySchema): AppMemorySchema {
    const currentHelpCenter = current[HELP_CENTER_TABLE_NAME];
    const incomingHelpCenter = incoming[HELP_CENTER_TABLE_NAME];
    const currentPrivacyConsentsById = currentHelpCenter.privacyConsentsById ?? {};
    const incomingPrivacyConsentsById = incomingHelpCenter.privacyConsentsById ?? {};
    const mergedPrivacyConsentsById = {
      ...currentPrivacyConsentsById,
      ...incomingPrivacyConsentsById
    };
    const mergedPrivacyConsentIds = [
      ...(currentHelpCenter.privacyConsentIds ?? []),
      ...(incomingHelpCenter.privacyConsentIds ?? [])
    ];
    return {
      ...incoming,
      [HELP_CENTER_TABLE_NAME]: {
        ...incomingHelpCenter,
        privacyConsentsById: mergedPrivacyConsentsById,
        privacyConsentIds: [...new Set([
          ...mergedPrivacyConsentIds,
          ...Object.keys(mergedPrivacyConsentsById)
        ])],
        guideFieldsById: {
          ...(currentHelpCenter.guideFieldsById ?? {}),
          ...(incomingHelpCenter.guideFieldsById ?? {})
        },
        guideFieldIds: [...new Set([
          ...(currentHelpCenter.guideFieldIds ?? []),
          ...(incomingHelpCenter.guideFieldIds ?? [])
        ])]
      }
    };
  }

private createEmptyState(): AppMemorySchema { return { notifications: { byId: {}, ids: [], idsByRecipientUserId: {}, mutedByUserId: {}, seededUserIds: [] }, chats: { byId: {}, ids: [] }, chatMessages: { byId: {}, ids: [], idsByChatKey: {} }, contacts: { chatAccessById: {} }, [SAMPLE_CARDS_TABLE_NAME]: { byId: {}, ids: [] }, [USERS_TABLE_NAME]: { byId: {}, ids: [] }, [HELP_CENTER_TABLE_NAME]: {
        seeded: false,
        activeRevisionId: null,
        seededKinds: {},
        activeRevisionIdsByKind: {},
        revisionsById: {},
        revisionIds: [],
        auditById: {},
        auditIds: [],
        guideFieldsById: {},
        guideFieldIds: [],
        privacyConsentsById: {},
        privacyConsentIds: []
      } }; }
  private normalizeState(value: unknown, fallback = this.createEmptyState()): AppMemorySchema {
 const source = value && typeof value === 'object' ? value as Partial<AppMemorySchema> : {};
 const users = source[USERS_TABLE_NAME];
 const helpCenterSource = source[HELP_CENTER_TABLE_NAME];
 const sampleCards = source[SAMPLE_CARDS_TABLE_NAME];
 return {
 notifications: { byId: { ...(source.notifications?.byId ?? {}) }, ids: [...(source.notifications?.ids ?? [])], idsByRecipientUserId: { ...(source.notifications?.idsByRecipientUserId ?? {}) }, mutedByUserId: { ...(source.notifications?.mutedByUserId ?? {}) }, seededUserIds: [...(source.notifications?.seededUserIds ?? [])] },
 chats: { byId: { ...(source.chats?.byId ?? fallback.chats.byId) }, ids: [...(source.chats?.ids ?? fallback.chats.ids)] },
 chatMessages: { byId: { ...(source.chatMessages?.byId ?? fallback.chatMessages.byId) }, ids: [...(source.chatMessages?.ids ?? fallback.chatMessages.ids)], idsByChatKey: { ...(source.chatMessages?.idsByChatKey ?? fallback.chatMessages.idsByChatKey) } },
 contacts: { chatAccessById: { ...(source.contacts?.chatAccessById ?? fallback.contacts.chatAccessById) } },
 [SAMPLE_CARDS_TABLE_NAME]: {
   byId: sampleCards?.byId && typeof sampleCards.byId === 'object' ? { ...sampleCards.byId } : fallback.sampleCards.byId,
   ids: Array.isArray(sampleCards?.ids) ? [...sampleCards.ids] : [...fallback.sampleCards.ids]
 }, [USERS_TABLE_NAME]: { byId: users?.byId && typeof users.byId === 'object' ? { ...users.byId } : fallback.users.byId, ids: Array.isArray(users?.ids) ? [...users.ids] : [...fallback.users.ids] }, [HELP_CENTER_TABLE_NAME]: {
        baseGroups: helpCenterSource?.baseGroups ?? {},
        seeded: helpCenterSource?.seeded === true || fallback[HELP_CENTER_TABLE_NAME].seeded === true,
        activeRevisionId: typeof helpCenterSource?.activeRevisionId === 'string'
          ? helpCenterSource.activeRevisionId
          : fallback[HELP_CENTER_TABLE_NAME].activeRevisionId,
        seededKinds: helpCenterSource?.seededKinds && typeof helpCenterSource.seededKinds === 'object'
          ? { ...helpCenterSource.seededKinds }
          : { ...(fallback[HELP_CENTER_TABLE_NAME].seededKinds ?? {}) },
        activeRevisionIdsByKind: helpCenterSource?.activeRevisionIdsByKind && typeof helpCenterSource.activeRevisionIdsByKind === 'object'
          ? { ...helpCenterSource.activeRevisionIdsByKind }
          : { ...(fallback[HELP_CENTER_TABLE_NAME].activeRevisionIdsByKind ?? {}) },
        revisionsById: helpCenterSource?.revisionsById && typeof helpCenterSource.revisionsById === 'object'
          ? { ...helpCenterSource.revisionsById }
          : { ...fallback[HELP_CENTER_TABLE_NAME].revisionsById },
        revisionIds: Array.isArray(helpCenterSource?.revisionIds)
          ? helpCenterSource.revisionIds.map(id => String(id))
          : [...fallback[HELP_CENTER_TABLE_NAME].revisionIds],
        auditById: helpCenterSource?.auditById && typeof helpCenterSource.auditById === 'object'
          ? { ...helpCenterSource.auditById }
          : { ...fallback[HELP_CENTER_TABLE_NAME].auditById },
        auditIds: Array.isArray(helpCenterSource?.auditIds)
          ? helpCenterSource.auditIds.map(id => String(id))
          : [...fallback[HELP_CENTER_TABLE_NAME].auditIds],
        guideFieldsById: helpCenterSource?.guideFieldsById && typeof helpCenterSource.guideFieldsById === 'object'
          ? { ...helpCenterSource.guideFieldsById }
          : { ...(fallback[HELP_CENTER_TABLE_NAME].guideFieldsById ?? {}) },
        guideFieldIds: Array.isArray(helpCenterSource?.guideFieldIds)
          ? helpCenterSource.guideFieldIds.map(id => String(id))
          : [...(fallback[HELP_CENTER_TABLE_NAME].guideFieldIds ?? [])],
        privacyConsentsById: helpCenterSource?.privacyConsentsById && typeof helpCenterSource.privacyConsentsById === 'object'
          ? { ...helpCenterSource.privacyConsentsById }
          : { ...(fallback[HELP_CENTER_TABLE_NAME].privacyConsentsById ?? {}) },
        privacyConsentIds: Array.isArray(helpCenterSource?.privacyConsentIds)
          ? helpCenterSource.privacyConsentIds.map(id => String(id))
          : [...(fallback[HELP_CENTER_TABLE_NAME].privacyConsentIds ?? [])]
      } };
}
  private indexedDbEntryForPersistence(_key: string,value: unknown): unknown { return this.indexedDbPlainValue(value); }
  private shouldPersistIndexedDbTable(key: string, value: unknown): boolean {
 if (!value || typeof value !== 'object') return false;
 const table = value as Record<string, unknown>;
 if (key === HELP_CENTER_TABLE_NAME) return Boolean(table['activeRevisionId'] || this.hasEntries(table['revisionIds']) || this.hasEntries(table['auditIds']) || this.hasEntries(table['privacyConsentIds']));
 if (key === CONTACTS_TABLE_NAME) return Object.keys((table['chatAccessById'] ?? {}) as object).length > 0;
 return this.hasEntries(table['ids']);
}
  private stateForLocalStoragePersistence(_state: AppMemorySchema): Partial<AppMemorySchema> { return {}; }
}

@Injectable({
  providedIn: 'root'
})
export class LocalMemoryDb extends AppMemoryDb {
  protected override get storageScope(): AppStorageScope {
    return 'demo';
  }
}

@Injectable({
  providedIn: 'root'
})
export class HttpMemoryDb extends AppMemoryDb {
  protected override get storageScope(): AppStorageScope {
    return 'http';
  }
}
