import { environment } from '../../../../environments/environment';

export type AppStorageScope = 'demo' | 'http';

export const APP_STORAGE_SCOPE: AppStorageScope = environment.activitiesDataSource === 'http'
  ? 'http'
  : 'demo';

export const APP_SCOPED_INDEXED_DB_NAME = APP_STORAGE_SCOPE === 'demo'
  ? 'myscoutee-template_demo_db'
  : 'myscoutee-template_http_db';

export const APP_SCOPED_INDEXED_DB_VERSION = 2;
export const APP_INDEXED_DB_KEYS = {
  tablesStore: 'tables',
  i18nBundlesStore: 'i18nBundles',
  memoryDb: 'memory.db.v1',
  chats: 'chats',
  contacts: 'contacts',
  chatMessages: 'chatMessages',
  helpCenter: 'helpCenter',
  contentModeration: 'contentModeration',
  notifications: 'notifications',
  users: 'users',
  sampleCards: 'sampleCards',
  chatVoiceClipPrefix: 'chatVoiceClip'
} as const;
export const APP_TABLES_STORE = APP_INDEXED_DB_KEYS.tablesStore;
export const APP_I18N_BUNDLES_STORE = APP_INDEXED_DB_KEYS.i18nBundlesStore;

export const APP_CACHE_KEYS = {
  runtimePrefix: 'myscoutee-template-runtime'
} as const;

export const APP_STORAGE_KEYS = {
  adminSupportSession: scopedStorageKey('admin-support.session.v1'),
  adminSession: scopedStorageKey('admin.session.v1'),
  demoActiveUser: scopedStorageKey('demo.active-user.v1'),
  demoCountryCode: scopedStorageKey('countryCode', 'demo'),
  entryConsent: scopedStorageKey('entry.gdpr-consent.v1'),
  entryConsentAudit: scopedStorageKey('entry.gdpr-consent-audit.v1'),
  locationTrackingEnabled: scopedStorageKey('location.tracking-enabled.v1'),
  entryLoginLocationEligibility: scopedStorageKey('entry.login-location-eligibility.v1'),
  explanationGuideEnabled: scopedStorageKey('explanation-guide.enabled.v1'),
  explanationGuideIntroductionSeen: scopedStorageKey('explanation-guide.introduction-seen.v1'),
  firebaseConfigurationInvalidation: scopedStorageKey(
    'firebase.configuration-invalidation.v1'
  ),
  firebaseAuthProfile: scopedStorageKey('firebase.auth-profile.v1'),
  messagingDeviceEnabled: scopedStorageKey('messaging.device-enabled.v1'),
  messagingDeviceId: scopedStorageKey('messaging.device-id.v1'),
  messagingToken: scopedStorageKey('messaging.token.v1'),
  messagingUserId: scopedStorageKey('messaging.user-id.v1'),
  optionalPrivacyApprovals: scopedStorageKey('privacy.optional-approvals.v1'),
  operatorBootstrapSession: scopedStorageKey('operator-bootstrap.session.v1'),
  operatorBootstrapToken: scopedStorageKey('operator-bootstrap.token.v1'),
  pwaInstallPromptDismissed: 'myscoutee-template.install-prompt.dismissed',
  pwaLoginInstallPromptOffered: 'myscoutee-template.install-prompt.login-offered',
  pwaUpdateReloadAttempt: 'myscoutee-template.update-reload-attempt',
  session: scopedSessionStorageKey()
} as const;

export function appScopedIndexedDbName(scope: AppStorageScope): string {
  return scope === 'demo'
    ? 'myscoutee-template_demo_db'
    : 'myscoutee-template_http_db';
}

export function scopedStorageKey(key: string, scope: AppStorageScope = APP_STORAGE_SCOPE): string {
  return `myscoutee-template.${scope}.${key.trim()}`;
}

export function scopedStorageKeyPrefix(scope: AppStorageScope = APP_STORAGE_SCOPE): string {
  return `myscoutee-template.${scope}.`;
}

export function scopedSessionStorageKey(scope: AppStorageScope = APP_STORAGE_SCOPE): string {
  return scopedStorageKey('session.v1', scope);
}

export function demoActiveUserStorageKey(scope: AppStorageScope = APP_STORAGE_SCOPE): string {
  return scopedStorageKey('demo.active-user.v1', scope);
}

export function appMemoryDbStorageKey(scope: AppStorageScope = APP_STORAGE_SCOPE): string {
  return scopedStorageKey(APP_INDEXED_DB_KEYS.memoryDb, scope);
}

export function appLocationStorageKey(userId: string, scope: AppStorageScope = APP_STORAGE_SCOPE): string {
  return scopedStorageKey(`location.v2:${userId.trim()}`, scope);
}

export function chatVoiceClipTableKey(key: string): string {
  return `${APP_INDEXED_DB_KEYS.chatVoiceClipPrefix}:${key.trim()}`;
}

export function offlineCacheUserStorageKey(userId: string, scope: AppStorageScope = APP_STORAGE_SCOPE): string {
  return scopedStorageKey(`offline.v1:user:${userId.trim()}`, scope);
}


export function profileOnboardingDraftStorageKey(userId: string, scope: AppStorageScope = APP_STORAGE_SCOPE): string {
  return scopedStorageKey(`profile-onboarding.v1:${userId.trim()}`, scope);
}

export function removeScopedStorageEntries(storage: Storage | undefined, scope: AppStorageScope): void {
  if (!storage) {
    return;
  }
  const prefix = scopedStorageKeyPrefix(scope);
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(prefix)) {
      keys.push(key);
    }
  }
  for (const key of keys) {
    storage.removeItem(key);
  }
}

export function createAppScopedObjectStores(db: IDBDatabase): void {
  if (!db.objectStoreNames.contains(APP_TABLES_STORE)) {
    db.createObjectStore(APP_TABLES_STORE);
  }
  if (!db.objectStoreNames.contains(APP_I18N_BUNDLES_STORE)) {
    db.createObjectStore(APP_I18N_BUNDLES_STORE);
  }
}
