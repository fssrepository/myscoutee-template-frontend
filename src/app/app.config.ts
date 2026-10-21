import { I18nService } from './shared/core/base/services/localization/i18n.service';
import { connectivityInterceptor } from './shared/core/http/interceptors/platform/connectivity.interceptor';
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient,withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideRouter } from '@angular/router';
import { SHARED_UI_PROVIDERS } from './shared/ui/context/ui.providers';
import { sessionModeInterceptor } from './shared/core/http/interceptors/accounts/session-mode.interceptor';
import { firebaseAuthInterceptor } from './shared/core/http/interceptors/accounts/firebase-auth.interceptor';
import { operatorBootstrapAuthInterceptor } from './shared/core/http/interceptors/operator/operator-bootstrap-auth.interceptor';
import { adminAccessInterceptor } from './shared/core/http/interceptors/access/admin-access.interceptor';
import { environment } from '../environments/environment';
import { ROUTE_CONFIG } from './shared/core/base/config';
import { preloadAdapterMode, type AdapterMode } from './shared/core/base/adapter-loaders';
export const appConfig: ApplicationConfig={
  providers: [
    provideAppInitializer(() => inject(I18nService).initialize()),
    ...SHARED_UI_PROVIDERS,provideBrowserGlobalErrorListeners(),provideRouter(routes),
    provideHttpClient(withInterceptors([connectivityInterceptor,sessionModeInterceptor,operatorBootstrapAuthInterceptor,firebaseAuthInterceptor,adminAccessInterceptor]))
  ]
};

export async function loadAppConfig(): Promise<ApplicationConfig> {
  const modes = new Set<AdapterMode>([environment.activitiesDataSource]);
  for (const entry of ROUTE_CONFIG.entries) {
    if (entry.mode) modes.add(entry.mode);
    else if (entry.http) modes.add('http');
  }
  await Promise.all([...modes].map(mode => preloadAdapterMode(mode)));
  return appConfig;
}
