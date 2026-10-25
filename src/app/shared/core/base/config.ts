import { AppUtils } from './app-utils';
export interface RouteConfigEntry {
  routePrefix: string;
  demoDelayMs?: number;
  requestTimeoutMs?: number;
  intervalMs?: number;
  demoIntervalMs?: number;
  mode?: RouteMode | null;
  http?: boolean;
}

export const APP_SETUP_CONFIG = {
  locationRequestTimeoutMs: 10_000
} as const;

export type RouteMode = 'local' | 'http';

export interface RouteConfig {
  defaultDemoDelayMs: number;
  defaultRequestTimeoutMs: number;
  defaultIntervalMs: number;
  entries: RouteConfigEntry[];
}

export interface ResolvedRouteConfig {
  routePrefix: string;
  demoDelayMs: number;
  requestTimeoutMs: number;
  intervalMs: number;
  demoIntervalMs: number;
  mode: RouteMode | null;
  http: boolean;
}

function demoRoutes(...routePrefixes: string[]): RouteConfigEntry[] {
  return routePrefixes.map(routePrefix => ({ routePrefix, demoDelayMs: 0 }));
}

export const ROUTE_CONFIG: RouteConfig = {
  defaultDemoDelayMs: 0,
  defaultRequestTimeoutMs: 3000,
  defaultIntervalMs: 0,
  entries: [
    ...demoRoutes('/auth/demo-users', '/auth/me'),
    {
      routePrefix: '/auth/me/onboarding-draft-autosave',
      intervalMs: 30000
    },
    ...demoRoutes('/auth/me/feedback', '/auth/me/experiences'),
    {
      routePrefix: '/auth/me/preferences',
      demoDelayMs: 0
    },
    {
      routePrefix: '/auth/me/report-user',
      demoDelayMs: 0
    },
    {
      routePrefix: '/auth/me/realtime/long-poll',
      demoDelayMs: 0,
      intervalMs: 30000,
      demoIntervalMs: 10000
    },
    ...demoRoutes('/auth/me/logout', '/auth/me/delete'),
    {
      routePrefix: '/help',
      demoDelayMs: 0
    },
    ...demoRoutes('/help/active', '/privacy'),
    {
      routePrefix: '/privacy/active',
      demoDelayMs: 0
    },
    ...demoRoutes('/privacy/consents', '/terms'),
    {
      routePrefix: '/terms/active',
      demoDelayMs: 0
    },
    ...demoRoutes('/explanation', '/explanation/active'),
    {
      routePrefix: '/notifications',
      demoDelayMs: 0,
      intervalMs: 30000,
      demoIntervalMs: 10000
    },
    {
      routePrefix: '/media/images/import',
      demoDelayMs: 0,
      requestTimeoutMs: 15000
    },
    {
      routePrefix: '/media/images',
      demoDelayMs: 0,
      requestTimeoutMs: 15000
    },
    {
      routePrefix: '/media/audio',
      demoDelayMs: 0,
      requestTimeoutMs: 20000
    }
  ]
};

export function resolveRouteConfigEntry(url: string): RouteConfigEntry | null {
  const normalizedUrl = normalizeRouteUrl(url);
  let bestMatchLength = -1;
  let selectedEntry: RouteConfigEntry | null = null;

  for (const entry of ROUTE_CONFIG.entries) {
    const normalizedPrefix = normalizeRouteUrl(entry.routePrefix);
    if (!isRoutePrefixMatch(normalizedUrl, normalizedPrefix)) {
      continue;
    }
    if (normalizedPrefix.length <= bestMatchLength) {
      continue;
    }
    bestMatchLength = normalizedPrefix.length;
    selectedEntry = entry;
  }

  return selectedEntry;
}

export function resolveRouteConfig(url: string): ResolvedRouteConfig {
  const normalizedUrl = normalizeRouteUrl(url);
  const entry = resolveRouteConfigEntry(normalizedUrl);
  const configuredMode = normalizeRouteMode(entry?.mode ?? null);
  return {
    routePrefix: entry?.routePrefix ?? normalizedUrl,
    demoDelayMs: normalizeDelayMs(entry?.demoDelayMs ?? ROUTE_CONFIG.defaultDemoDelayMs),
    requestTimeoutMs: normalizeDelayMs(entry?.requestTimeoutMs ?? ROUTE_CONFIG.defaultRequestTimeoutMs),
    intervalMs: normalizeDelayMs(entry?.intervalMs ?? ROUTE_CONFIG.defaultIntervalMs),
    demoIntervalMs: normalizeDelayMs(entry?.demoIntervalMs ?? ROUTE_CONFIG.defaultIntervalMs),
    mode: configuredMode,
    http: entry?.http === true || configuredMode === 'http'
  };
}

function normalizeRouteUrl(url: string): string {
  const [pathOnly] = url.split('?');
  const [withoutHash] = (pathOnly || '').split('#');
  const trimmed = withoutHash.trim();
  if (!trimmed || trimmed === '/') {
    return '/';
  }
  return trimmed.startsWith('/') ? AppUtils.trimEndCharacters(trimmed, "/") : AppUtils.trimEndCharacters(`/${trimmed}`, "/");
}

function isRoutePrefixMatch(url: string, prefix: string): boolean {
  if (prefix === '/') {
    return true;
  }
  return url === prefix || url.startsWith(`${prefix}/`);
}

function normalizeDelayMs(value: number): number {
  return Math.max(0, Math.trunc(value));
}

function normalizeRouteMode(value: RouteMode | null | undefined): RouteMode | null {
  return value === 'local' || value === 'http' ? value : null;
}
