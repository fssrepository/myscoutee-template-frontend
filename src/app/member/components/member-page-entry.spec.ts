import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { routes } from '../../app.routes';
import { EntryPageComponent } from '../../entry/components/entry-page.component';
import { MemberPageComponent } from './member-page.component';
import { UserDto } from '../../shared/core/contracts/accounts/user.interface';
import { UsersService, USER_BY_ID_LOAD_CONTEXT_KEY } from '../../shared/core/base/services/accounts/users.service';
import { SessionService } from '../../shared/core/base/services/accounts/session.service';
import { HttpUsersService } from '../../shared/core/http/services/accounts/users.service';
import { PrivacyPolicyService } from '../../shared/core/base/services/help/privacy-policy.service';
import { SeedDemoBootstrapService } from '../../shared/core/local/seed/services/platform/demo-bootstrap.service';
import { LocalUsersRepository } from '../../shared/core/local/source/repositories/accounts/users.repository';
import { LocalNotificationsRepository } from '../../shared/core/local/source/repositories/notifications/notifications.repository';
import { LocalCountryPartitionsRepository } from '../../shared/core/local/source/repositories/platform/country-partitions.repository';
import { UserProfileStore } from '../../shared/ui/context/stores/profile/user-profile.store';
import { AppRuntimeStore } from '../../shared/ui/context/stores/app/app-runtime.store';
import { DemoBootstrapSelectorStore } from '../../shared/ui/context/stores/app/demo-bootstrap-selector.store';

describe('shared local workspace entry sequence', () => {
 const originalMode = environment.activitiesDataSource;
 afterEach(() => { environment.activitiesDataSource = originalMode; TestBed.resetTestingModule(); vi.useRealTimers(); });

 it.each(['member', 'admin', 'operator'] as const)('closes the %s selector on route activation while the destination keeps the configured avatar load pending', async role => {
  vi.useFakeTimers();
  environment.activitiesDataSource = 'local';
  const user = { ...new UserDto(), id: role, name: role, profileStatus: 'public', admin: role === 'admin', operator: role === 'operator' };
  const session = { kind: 'demo', userId: role };
  const privacy = { activeRevision: () => ({ id: 'privacy', version: 1 }), loadConsent: vi.fn() };
  const router = { events: new Subject(), navigateByUrl: vi.fn(), createUrlTree: vi.fn(() => 'entry') };
  TestBed.configureTestingModule({ providers: [
   { provide: SessionService, useValue: {
    identity: () => `demo:${role}`, currentSession: () => session, ensureSession: async () => session,
    startDemoSession: () => session
   } },
   { provide: HttpUsersService, useValue: {} },
   { provide: LocalUsersRepository, useValue: { whenReady: async () => undefined, queryUserById: () => user } },
   { provide: LocalNotificationsRepository, useValue: {} },
   { provide: LocalCountryPartitionsRepository, useValue: {} },
   { provide: SeedDemoBootstrapService, useValue: { ensureDemoSelectorReady: async () => undefined } },
   { provide: PrivacyPolicyService, useValue: privacy },
   { provide: Router, useValue: router }
  ] });
  const users = TestBed.inject(UsersService);
  const profiles = TestBed.inject(UserProfileStore);
  const runtime = TestBed.inject(AppRuntimeStore);
  const selector = TestBed.inject(DemoBootstrapSelectorStore);
  vi.spyOn(selector, 'ensureDemoBootstrapSelectorLoaded').mockResolvedValue();
  const member = Object.assign(Object.create(MemberPageComponent.prototype), {
   users, profiles, session: TestBed.inject(SessionService), hydrationRequestVersion: 0
  });
  let hydration!: Promise<void>;
  const destination = role === 'member' ? 'home' : role;
  const home = routes.find(route => route.path === destination)!;
  router.navigateByUrl.mockImplementation(async url => {
   const allowed = await TestBed.runInInjectionContext(() => (home.canActivate![0] as Function)({ data: home.data, routeConfig: home }, { url }));
   expect(allowed).toBe(true);
   hydration = member.hydrateUserAfterLogin(role);
   return true;
  });
  const entry = Object.assign(Object.create(EntryPageComponent.prototype), {
   localMode: true, pendingEntry: 'explore', users, profiles, privacy, router, selector,
   session: TestBed.inject(SessionService), error: signal(''),
   route: { snapshot: { queryParamMap: new Map() } },
   ensureLocationAllowed: vi.fn().mockResolvedValue(true)
  });
  await entry.continueEntry();
  await selector.demoBootstrapSelector()!.onSelect(role, role);
  expect(selector.demoBootstrapSelector()).toBeNull();
  expect(router.navigateByUrl).toHaveBeenCalledExactlyOnceWith('/' + destination);
  expect(privacy.loadConsent).not.toHaveBeenCalled();
  expect(runtime.getLoadingState(USER_BY_ID_LOAD_CONTEXT_KEY).status).toBe('loading');
  expect(profiles.activeUserProfile()).toBeNull();
  await vi.advanceTimersByTimeAsync(1499);
  expect(runtime.getLoadingState(USER_BY_ID_LOAD_CONTEXT_KEY).status).toBe('loading');
  await vi.advanceTimersByTimeAsync(1);
  await hydration;
  expect(runtime.getLoadingState(USER_BY_ID_LOAD_CONTEXT_KEY).status).toBe('success');
  expect(profiles.activeUserProfile()?.id).toBe(role);
 });
});

describe('destination account consent follows the native side menu', () => {
 it('uses the hydrated server profile rather than a different Firebase UID for consent', () => {
  const user = { id: 'server-profile-id' };
  const value = Object.assign(Object.create(MemberPageComponent.prototype), {
   users: { peekCurrentUser: () => user }, profiles: { activeUserProfile: () => user },
   activeUserLoadState: () => ({ status: 'success' })
  });
  expect(value.privacyConsentAccountId()).toBe('server-profile-id');
  value.activeUserLoadState = () => ({ status: 'loading' });
  expect(value.privacyConsentAccountId()).toBe('');
  value.activeUserLoadState = () => ({ status: 'success' });
  value.users.peekCurrentUser = () => null;
  expect(value.privacyConsentAccountId()).toBe('');
 });
 const revision = { id: 'privacy', version: 2 };
 const key = 'member::privacy:v2';
 function member(consent: unknown) {
  return Object.assign(Object.create(MemberPageComponent.prototype), {
   privacyConsentCheckKey: key, privacyConsentCheckToken: 0,
   privacy: { loadConsent: vi.fn().mockResolvedValue(consent), syncAnonymousEntryConsent: vi.fn().mockResolvedValue(true) },
   profile: { clearPrivacyConsentRequirement: vi.fn(), requirePrivacyConsent: vi.fn(), openSettingsPopup: vi.fn() }
  });
 }
 it('retains existing account choices instead of overwriting them with entry choices', async () => {
  const value = member({ revisionId: 'privacy', revisionVersion: 2 });
  await value.ensureActivePrivacyConsent('member', revision, key);
  expect(value.privacy.syncAnonymousEntryConsent).not.toHaveBeenCalled();
  expect(value.profile.clearPrivacyConsentRequirement).toHaveBeenCalledOnce();
 });
 it('synchronizes accepted entry consent for an account without current consent', async () => {
  const value = member(null);
  await value.ensureActivePrivacyConsent('member', revision, key);
  expect(value.privacy.syncAnonymousEntryConsent).toHaveBeenCalledExactlyOnceWith('member', revision);
  expect(value.profile.requirePrivacyConsent).not.toHaveBeenCalled();
 });
 it.each(['missing', 'failed'])('requires the existing privacy popup when consent is %s', async outcome => {
  const value = member(null);
  value.privacy.syncAnonymousEntryConsent.mockResolvedValue(false);
  if (outcome === 'failed') value.privacy.loadConsent.mockRejectedValue(new Error('offline'));
  await value.ensureActivePrivacyConsent('member', revision, key);
  expect(value.profile.requirePrivacyConsent).toHaveBeenCalledExactlyOnceWith(key);
  expect(value.profile.openSettingsPopup).toHaveBeenCalledExactlyOnceWith('privacy');
 });
 it('ignores a consent response after leaving the destination', async () => {
  const value = member(null);
  const pending = value.ensureActivePrivacyConsent('member', revision, key);
  value.privacyConsentCheckToken++;
  await pending;
  expect(value.privacy.syncAnonymousEntryConsent).not.toHaveBeenCalled();
  expect(value.profile.openSettingsPopup).not.toHaveBeenCalled();
 });
});
