import { inject, Injector } from '@angular/core';
import { CanActivateFn, ResolveFn, Router, Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { SessionService } from './shared/core/base/services/accounts/session.service';
import { UsersService } from './shared/core/base/services/accounts/users.service';
import { PrivacyPolicyService } from './shared/core/base/services/help/privacy-policy.service';

const sessionGuard: CanActivateFn = async (route, state) => {
 const injector = inject(Injector);
 const sessionService = inject(SessionService);
 const users = inject(UsersService);
 const privacy = inject(PrivacyPolicyService);
 const router = inject(Router);
 const entry = () => router.createUrlTree(['/entry'], { queryParams: state.url && state.url !== '/' ? { redirect: state.url } : undefined });
 try {
  const session = await sessionService.ensureSession();
  if (!session) return entry();
  if (users.localModeEnabled) {
   const { SeedDemoBootstrapService } = await import('./shared/core/local/seed/services/platform/demo-bootstrap.service');
   await injector.get(SeedDemoBootstrapService).ensureDemoSelectorReady('union');
  }
  const cachedWorkspaceUser = users.localModeEnabled && session.kind === 'demo'
   && ['home', 'admin', 'operator'].includes(route.routeConfig?.path ?? '')
   ? users.peekCachedUserById(session.userId) : null;
  const user = cachedWorkspaceUser ?? users.peekCurrentUser() ?? await users.loadUserById(session.kind === 'demo' ? session.userId : undefined);
  if (!user || ['blocked', 'inactive', 'deleted', 'onboarding'].includes(user.profileStatus)) return entry();
  // Native member/admin/operator shells own account consent. Standalone MCP
  // authorization retains its consent gate before activating that page.
  if (!users.localModeEnabled && route.routeConfig?.path === 'mcp/authorize') {
   const revision = await privacy.prepareOpen();
   if (!revision) return entry();
   const consent = await privacy.loadConsent(user.id, revision.id, revision.version);
   if (!consent || consent.revisionId !== revision.id || consent.revisionVersion < revision.version) return entry();
  }
  const role = user.operator ? 'operator' : user.admin ? 'admin' : 'member';
  return route.data['allowRoleProfiles'] === true || role === route.data['role']
   ? true : router.createUrlTree([role === 'member' ? '/home' : '/' + role]);
 } catch { return entry(); }
};

const publicContent: ResolveFn<void> = async () => {
 const injector = inject(Injector);
 if (environment.activitiesDataSource === 'local') {
  const { SeedStaticContentService } = await import('./shared/core/local/seed/services/platform/static-content.service');
  await injector.get(SeedStaticContentService).ensureReady();
 }
};

export const routes: Routes = [
 { path: '', pathMatch: 'full', redirectTo: 'entry' },
 { path: 'entry', resolve: { content: publicContent }, loadComponent: () => import('./entry/components/entry-page.component').then(m => m.EntryPageComponent) },
 { path: 'mcp/authorize', canActivate: [sessionGuard], data: { allowRoleProfiles: true }, loadComponent: () => import('./profile/components/integration-settings-popup/mcp-authorization.component').then(m => m.McpAuthorizationComponent) },
 { path: 'home', canActivate: [sessionGuard], data: { role: 'member' }, loadComponent: () => import('./member/components/member-page.component').then(m => m.MemberPageComponent) },
 { path: 'admin', canActivate: [sessionGuard], data: { role: 'admin' }, loadComponent: () => import('./member/components/member-page.component').then(m => m.MemberPageComponent) },
 { path: 'operator', canActivate: [sessionGuard], data: { role: 'operator' }, loadComponent: () => import('./member/components/member-page.component').then(m => m.MemberPageComponent) },
 { path: 'privacy-policy', resolve: { content: publicContent }, data: { documentKind: 'privacy' }, loadComponent: () => import('./shared/ui/components/document-viewer').then(m => m.DocumentViewerComponent) },
 { path: 'terms', resolve: { content: publicContent }, data: { documentKind: 'terms' }, loadComponent: () => import('./shared/ui/components/document-viewer').then(m => m.DocumentViewerComponent) },
 { path: '**', redirectTo: 'entry' }
];
