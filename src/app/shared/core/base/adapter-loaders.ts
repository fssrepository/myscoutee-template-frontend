import type { Type } from '@angular/core';

export const LOCAL_ADAPTER = {
  DEVICE_REGISTRATIONS: 'LocalDeviceRegistrationsService',
  USERS: 'LocalUsersService',
  CHATS: 'LocalChatsService',
  OPERATOR_EMAIL: 'LocalOperatorEmailService',
  HELP_CENTER: 'LocalHelpCenterService',
  INTEGRATION: 'LocalIntegrationService',
  MEDIA: 'LocalMediaService',
  NOTIFICATIONS: 'LocalNotificationsService',
  OPERATOR_CONFIGURATION: 'LocalOperatorConfigurationService',
  OPERATOR_UPDATE: 'LocalOperatorUpdateService',
  DEPLOYMENT_CONFIGURATION: 'LocalDeploymentConfigurationService',
  SHOWCASE: 'LocalShowcaseService'
} as const;

export const HTTP_ADAPTER = {
  DEVICE_REGISTRATIONS: 'HttpDeviceRegistrationsService',
  USERS: 'HttpUsersService',
  CHATS: 'HttpChatsService',
  OPERATOR_EMAIL: 'HttpOperatorEmailService',
  HELP_CENTER: 'HttpHelpCenterService',
  INTEGRATION: 'HttpIntegrationService',
  MEDIA: 'HttpMediaService',
  NOTIFICATIONS: 'HttpNotificationsService',
  OPERATOR_CONFIGURATION: 'HttpOperatorConfigurationService',
  OPERATOR_UPDATE: 'HttpOperatorUpdateService',
  DEPLOYMENT_CONFIGURATION: 'HttpDeploymentConfigurationService',
  SHOWCASE: 'HttpShowcaseService'
} as const;

type LocalTypes = typeof import('./local-adapters').LOCAL_ADAPTER_TYPES;
type HttpTypes = typeof import('./http-adapters').HTTP_ADAPTER_TYPES;
export type AdapterKey = keyof LocalTypes | keyof HttpTypes;
export type AdapterInstance<K extends AdapterKey> = InstanceType<(LocalTypes & HttpTypes)[K]>;
export type AdapterMode = 'local' | 'http';
const constructors: Partial<Record<AdapterKey, Type<unknown>>> = {};
let localModule: Promise<LocalTypes> | undefined;
let httpModule: Promise<HttpTypes> | undefined;

// One import/cache per side. Route selection stays in BaseRouteModeService.
function loadLocal(): Promise<LocalTypes> {
  return localModule ??= import('./local-adapters').then(module => {
    Object.assign(constructors, module.LOCAL_ADAPTER_TYPES);
    return module.LOCAL_ADAPTER_TYPES;
  }).catch(error => { localModule = undefined; throw error; });
}

function loadHttp(): Promise<HttpTypes> {
  return httpModule ??= import('./http-adapters').then(module => {
    Object.assign(constructors, module.HTTP_ADAPTER_TYPES);
    return module.HTTP_ADAPTER_TYPES;
  }).catch(error => { httpModule = undefined; throw error; });
}

export const ADAPTER_MODE_LOADERS = { local: loadLocal, http: loadHttp };

export async function preloadAdapterMode(mode: AdapterMode): Promise<void> {
  await ADAPTER_MODE_LOADERS[mode]();
}

export function cachedAdapterType<K extends AdapterKey>(key: K): Type<AdapterInstance<K>> | undefined {
  return constructors[key] as Type<AdapterInstance<K>> | undefined;
}

type AdapterLoaders = { [K in AdapterKey]: () => Promise<Type<AdapterInstance<K>>> };

export const ADAPTER_LOADERS = Object.fromEntries([
  ...Object.values(LOCAL_ADAPTER).map(key => [key, () => loadLocal().then(types => types[key])]),
  ...Object.values(HTTP_ADAPTER).map(key => [key, () => loadHttp().then(types => types[key])])
]) as AdapterLoaders;
