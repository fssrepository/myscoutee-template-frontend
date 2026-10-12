import { connectivityInterceptor } from './shared/core/http/interceptors/platform/connectivity.interceptor';
import { ApplicationConfig,provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient,withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideRouter } from '@angular/router';
import { SHARED_UI_PROVIDERS } from './shared/ui/context/ui.providers';
import { sessionModeInterceptor } from './shared/core/http/interceptors/accounts/session-mode.interceptor';
import { firebaseAuthInterceptor } from './shared/core/http/interceptors/accounts/firebase-auth.interceptor';
import { operatorBootstrapAuthInterceptor } from './shared/core/http/interceptors/operator/operator-bootstrap-auth.interceptor';
import { adminAccessInterceptor } from './shared/core/http/interceptors/access/admin-access.interceptor';
export const appConfig: ApplicationConfig={
  providers: [
    ...SHARED_UI_PROVIDERS,provideBrowserGlobalErrorListeners(),provideRouter(routes),
    provideHttpClient(withInterceptors([connectivityInterceptor,sessionModeInterceptor,operatorBootstrapAuthInterceptor,firebaseAuthInterceptor,adminAccessInterceptor]))
  ]
};
