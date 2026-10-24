import { SessionService } from './shared/core/base/services/accounts/session.service';
import { sessionAuthInterceptor } from './shared/core/http/interceptors/accounts/session-auth.interceptor';
import { anonymousLanding } from './shared/core/common/demo-failover';
import { I18nService } from './shared/core/base/services/localization/i18n.service';
import { connectivityInterceptor } from './shared/core/http/interceptors/platform/connectivity.interceptor';
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { routes } from './app.routes';
import { provideRouter } from '@angular/router';
import { SHARED_UI_PROVIDERS } from './shared/ui/context/ui.providers';
import { sessionModeInterceptor } from './shared/core/http/interceptors/accounts/session-mode.interceptor';
import { environment } from '../environments/environment';
import { ROUTE_CONFIG } from './shared/core/base/config';
import { preloadAdapterMode, type AdapterMode } from './shared/core/base/adapter-loaders';
export const appConfig: ApplicationConfig={
  providers: [
    provideAppInitializer(() => Promise.all([inject(I18nService).initialize(), inject(SessionService).ensureSession()])),
    ...SHARED_UI_PROVIDERS,provideBrowserGlobalErrorListeners(),provideRouter(routes),
  ]
};

export async function loadAppConfig(): Promise<ApplicationConfig> {
  const modes = new Set<AdapterMode>([environment.activitiesDataSource]);
  for (const entry of ROUTE_CONFIG.entries) {
    if (entry.mode) modes.add(entry.mode);
    else if (entry.http) modes.add('http');
  }
  const phase = environment.activitiesDataSource === 'http' && anonymousLanding() ? 'entry' : 'workspace';
  await Promise.all([...modes].map(mode => preloadAdapterMode(mode, phase)));
  return appConfig;
}
