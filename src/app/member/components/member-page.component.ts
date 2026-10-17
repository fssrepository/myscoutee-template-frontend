import { AppRuntimeStore } from '../../shared/ui/context/stores/app/app-runtime.store';
import { backendUnavailable } from '../../shared/core/common/backend-connectivity';
import { OperatorPageComponent } from '../../operator/components/operator-page/operator-page.component';
import { ProfileHeaderCardConverter } from '../../shared/ui/converters/profile/profile-header-card.converter';
import { HomeHeaderComponent } from '../../home/components/home-header/home-header.component';
import { MatIconModule } from '@angular/material/icon';
import {OperatorUpdatePopupComponent} from '../../operator/components/operator-update-popup/operator-update-popup.component';
import {DeploymentConfigurationService} from '../../shared/core/base/services/platform/deployment-configuration.service';
import {OperatorConfigurationPopupComponent} from '../../operator/components/operator-configuration-popup/operator-configuration-popup.component';
import { AppSetupStore } from '../../shared/ui/context/stores/app/app-setup.store';
import { AppSetupPopupComponent } from '../../shared/ui/components/app-setup-popup/app-setup-popup.component';
import { ChatComponent } from './chat/chat.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { ShowcaseComponent, SHOWCASE_VIEW_OPTIONS } from './showcase/showcase.component';
import { Component, computed, effect, inject, signal, untracked, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppMenuComponent, HeaderCardComponent, IndicatorComponent, I18nPipe, DialogStore, ExplanationGuideService, FloatingLauncherComponent, PopupComponent, UiTaskScheduler, UiPollCoordinator, PopupPresenceStore, type AppMenuTrigger, type AppMenuItem, type HeaderCardModel, type AppMenuModel, type PopupModel } from '@fssrepository/myscoutee-components';
import { NotificationCenterStore } from '../../shared/ui/context/stores/notification/notification-center.store';
import { NotificationCenterPopupComponent } from '../../shared/ui/components/notification-center-popup/notification-center-popup.component';
import { ExplanationLauncherComponent } from '../../shared/ui/components/explanation-popup/explanation-launcher.component';
import { HelpCenterService } from '../../shared/core/base/services/help/help-center.service';
import { UsersService, USER_BY_ID_LOAD_CONTEXT_KEY } from '../../shared/core/base/services/accounts/users.service';
import { PrivacyPolicyService } from '../../shared/core/base/services/help/privacy-policy.service';
import type { GuideRevision } from '@fssrepository/myscoutee-components';
import { ProfileStore } from '../../shared/ui/context/stores/profile/profile.store';
import { ProfileSettingsPopupsComponent } from '../../profile/components/settings-popups/settings-popups.component';
import { SessionService } from '../../shared/core/base/services/accounts/session.service';
import { UserProfileStore } from '../../shared/ui/context/stores/profile/user-profile.store';
import { ProfileEditorStore } from '../../shared/ui/context/stores/profile/profile-editor.store';
import { NgComponentOutlet } from '@angular/common';

@Component({
 selector: 'app-member-page', standalone: true,
 host: { '[attr.data-guide-surface]': "role === 'member' && page() === 'chat' ? 'chat' : 'home'" },
 imports: [OperatorPageComponent, HomeHeaderComponent, MatIconModule, PopupComponent, OperatorUpdatePopupComponent,OperatorConfigurationPopupComponent, AppSetupPopupComponent, I18nPipe, ShowcaseComponent, ChatComponent, AppMenuComponent, HeaderCardComponent, NgComponentOutlet, IndicatorComponent, ProfileSettingsPopupsComponent, NotificationCenterPopupComponent, ExplanationLauncherComponent, FloatingLauncherComponent],
 templateUrl: './member-page.component.html', styleUrl: './member-page.component.scss'
})
export class MemberPageComponent implements OnDestroy {
 @HostListener('window:online')
 protected onWindowOnline(): void { this.runtime.setOnlineState(true); }
 @HostListener('window:offline')
 protected onWindowOffline(): void { this.runtime.setOnlineState(false); }
 protected readonly deployment=inject(DeploymentConfigurationService);
 private readonly route = inject(ActivatedRoute);
 protected readonly role = this.route.snapshot.data['role'];
 private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
 protected readonly page = computed(() => {
  const page = this.params().get('page');
  return page === 'chat' || page === 'showcase' ? page : null;
 });
 protected readonly pagePopup = computed<PopupModel>(() => {
  const options = SHOWCASE_VIEW_OPTIONS;
  const current = options.find(option => option.id === this.params().get('view')) ?? options[2];
  return {
   title: this.page() === 'chat' ? 'chats' : 'showcase.title',
   size: 'wide', height: 'full', bodyLayout: 'fill', headerTone: 'accent',
   headerControls: this.page() === 'showcase' ? [{
    kind: 'menu', id: 'view', align: 'end', panelAlign: 'end',
    trigger: { label: current.label, icon: current.icon, palette: current.palette, layout: 'pill', collapsible: true },
    items: options.map(option => ({ ...option, kind: 'radio', surface: 'tinted', active: option.id === current.id }))
   }] : [],
   onMenuSelect: event => { void this.router.navigate([], { relativeTo: this.route,
    queryParams: { view: event.itemSelect.id }, queryParamsHandling: 'merge' }); },
   onClose: () => this.changePage(null)
  };
 });
 protected readonly configurationOpen = signal(false);
 protected readonly updateOpen = signal(false);
 protected readonly menuOpen = signal(false);
 protected readonly notifications = inject(NotificationCenterStore);
 protected readonly guide = inject(ExplanationGuideService);
 protected readonly popups = inject(PopupPresenceStore);
 private readonly runtime = inject(AppRuntimeStore);
 private readonly activeUserLoadState = this.runtime.selectLoadingState(USER_BY_ID_LOAD_CONTEXT_KEY);
 private readonly privacy = inject(PrivacyPolicyService);
 private hydrationRequestKey = '';
 private hydrationRequestVersion = 0;
 private privacyConsentCheckKey = '';
 private privacyConsentCheckToken = 0;
 private readonly offlineAttentionDismissed = signal(false);
 protected readonly connectionOffline = computed(() => !this.runtime.isOnline() || backendUnavailable());
 protected readonly floatingLauncherZIndex = computed(() => Math.max(24060, this.popups.topLayer() + 2));
 protected readonly notificationAttentionVisible = computed(() =>
  !this.notifications.muted() && !this.profiles.activeUserLocationMissing()
   && (this.notifications.attentionVisible() || (this.connectionOffline()
    && !this.offlineAttentionDismissed() && !this.notifications.isOpen())));
 protected readonly notificationAttentionTrigger = computed<AppMenuTrigger>(() => ({
  id: 'notification-attention', icon: this.connectionOffline() ? 'cloud_off' : 'notifications_active',
  palette: this.connectionOffline() ? 'offline' : 'violet', action: 'custom', hideLabel: true,
  counter: this.notifications.unreadCount() > 0 ? { value: this.notifications.unreadCount(), max: 99 } : null,
  ariaLabel: this.notificationLauncherAriaLabel() + (this.connectionOffline() ? ' — Offline' : '')
 }));
 protected readonly headerActions = computed<readonly AppMenuItem[]>(() => [
  { id: 'notifications', label: 'Notifications',
    disabled: this.notifications.permissionActionPending() || this.profiles.activeUserLocationMissing(),
    progress: { state: this.notifications.permissionBusy() ? 'loading' : null },
    icon: this.connectionOffline() ? 'cloud_off' : this.profiles.activeUserLocationMissing() || this.notifications.muted() ? 'notifications_off' : 'notifications',
    palette: this.connectionOffline() ? 'offline' : this.profiles.activeUserLocationMissing() || this.notifications.muted() ? 'slate' : this.notifications.unreadCount() > 0 ? 'violet' : 'neutral',
    counter: this.notifications.unreadCount() > 0 ? { value: this.notifications.unreadCount(), max: 99 } : null,
    counterTone: 'alert', ariaLabel: this.notificationLauncherAriaLabel() + (this.connectionOffline() ? ' — Offline' : '') },
  { id: 'explanations', label: 'Explanations', icon: 'tips_and_updates', kind: 'toggle',
    checked: this.guide.enabled(), ariaLabel: this.guide.enabled() ? 'Turn explanations off' : 'Turn explanations on' },
  { id: 'settings', label: 'Settings', icon: 'settings', ariaLabel: 'Open settings menu', items: this.settings() }
 ]);
 protected readonly settings = computed<readonly AppMenuItem[]>(() => [
  ...(this.role === 'member' ? [{ id: 'app-setup', label: 'install.app', icon: 'install_desktop' }] : []),
  { id: 'help', label: 'Help', icon: 'help_outline', ariaLabel: 'Open help' },
  { id: 'privacy', label: 'Privacy', icon: 'policy' },
  { id: 'terms', label: 'Terms', icon: 'rule' },
  ...(this.role === 'member' ? [{ id: 'delete-account', label: 'Delete account', icon: 'delete_forever', palette: 'danger' as const }] : []),
  { id: 'logout', label: 'logout', icon: 'logout' }
 ]);
 protected readonly pages = computed<AppMenuModel>(() => ({
  layout: 'grid', nodes: [{ id: 'activities', items: [
   { id: 'showcase', icon: 'dashboard', label: 'showcase.title', palette: 'teal' },
   { id: 'chat', icon: 'chat', label: 'chats', palette: 'blue', ariaLabel: 'Open chat',
     counter: (this.profiles.activeUserProfile()?.activities.chats ?? 0) > 0
      ? { value: this.profiles.activeUserProfile()!.activities.chats!, max: 99 } : null }
  ] }]
 }));
 protected readonly avatar = computed<readonly AppMenuItem[]>(() => {
  const user = this.profiles.activeUserProfile();
  const session=this.session.session();
  const bootstrap=session?.kind==='operator-bootstrap'?session:null;
  const status = this.activeUserLoadState().status;
  const loading = !bootstrap && (status === 'idle' || status === 'loading');
  const failed = !bootstrap && (status === 'error' || status === 'timeout');
  const canToggle = !!bootstrap || !!user && !loading && !failed;
  const label = failed ? 'Profile failed to load' : loading ? 'Loading profile'
   : this.menuOpen() ? 'Close user menu' : 'Open user menu';
  return [{ id: 'navigator-avatar', kind: 'action', layout: 'image',
   imageUrl: user?.images?.[0], imageFallback: user?.initials, imageAlt: user?.name,
   ariaLabel: label, icon: loading ? 'schedule' : failed ? 'person_off' : '',
   palette: canToggle ? user?.gender === 'man' ? 'blue' : 'pink' : 'neutral', disabled: !canToggle,
   progress: loading || failed ? { state: failed ? 'error' : 'loading', shape: 'circle', durationMs: 3000 } : null }];
 });
 protected readonly header = computed<HeaderCardModel>(() => {
  const user = this.profiles.activeUserProfile();
  const session=this.session.session();
  if (!user) return { title: session?.kind === 'operator-bootstrap' ? session.email : '', showEdit: false };
  const operator = this.role === 'operator';
  const model = ProfileHeaderCardConverter.convert(user, {
   admin: this.role === 'admin' || operator,
   headline: operator ? user.headline?.trim() || 'Operator workspace' : undefined,
   showEdit: true, editAriaLabel: operator ? 'operator.profile.open' : 'profile.edit',
   showRing: this.editor.saving(), ringState: this.editor.error() ? 'error' : 'loading'
  });
  return operator ? { ...model, badgeLabel: 'OPERATOR', metaIcon: 'settings_input_component' } : model;
 });
 protected readonly setup = inject(AppSetupStore);
 protected readonly session = inject(SessionService);
 protected readonly profiles = inject(UserProfileStore);
 protected readonly editor = inject(ProfileEditorStore);
 protected readonly profile = inject(ProfileStore);
 private readonly help = inject(HelpCenterService);
 private readonly users = inject(UsersService);
 private readonly dialogs = inject(DialogStore);
 private readonly router = inject(Router);
 private readonly pollCoordinator = inject(UiPollCoordinator);
 private realtimeCursor: string | null = null;
 private readonly realtime = new UiTaskScheduler<string>({
  intervalMs: () => this.session.session() && this.profiles.activeUserId() ? this.users.realtimePollIntervalMs() : 0,
  state: () => this.profiles.activeUserId(), pollCoordinator: this.pollCoordinator, pollPriority: 'notification',
  task: async ({ state: userId, signal }) => {
   const token = this.notifications.captureUnreadSyncToken();
   const snapshot = await this.users.pollUserRealtimeSnapshot(userId, this.realtimeCursor, signal);
   if (!snapshot || signal?.aborted || this.profiles.activeUserId() !== userId) return;
   this.realtimeCursor = snapshot.cursor;
   this.profiles.patchUserActivityCounters(userId, { chats: snapshot.counters.chats, chat: snapshot.counters.chat });
   this.profiles.applyUserRealtimeNotificationDevices(userId, snapshot.notificationDevices);
   if (typeof snapshot.counters.notifications === 'number') this.notifications.applyRealtimeUnreadCount(token, snapshot.counters.notifications);
  }
 });
 constructor() {
  effect(() => {
   const session = this.session.session();
   if (!session) {
    this.hydrationRequestKey = '';
    ++this.hydrationRequestVersion;
    return;
   }
   if (session.kind === 'operator-bootstrap') return;
   const userId = session.kind === 'demo' ? session.userId : session.profile.id;
   const requestKey = `${session.kind}:${userId}`;
   if (this.hydrationRequestKey === requestKey) return;
   this.hydrationRequestKey = requestKey;
   untracked(() => { void this.hydrateUserAfterLogin(userId); });
  });
  effect(() => {
   const session = this.session.session();
   const user = this.profiles.activeUserProfile();
   const revision = this.privacy.activeRevision();
   if (!session || session.kind === 'operator-bootstrap') {
    this.privacyConsentCheckKey = '';
    ++this.privacyConsentCheckToken;
    untracked(() => this.profile.clearPrivacyConsentRequirement());
    return;
   }
   if (!user || !this.privacyConsentAccountId()) return;
   if (!revision) { untracked(() => { void this.privacy.prepareOpen(); }); return; }
   const key = `${user.id}::${revision.id}:v${revision.version}`;
   if (this.privacyConsentCheckKey === key) return;
   this.privacyConsentCheckKey = key;
   untracked(() => { void this.ensureActivePrivacyConsent(user.id, revision, key); });
  });
  effect(() => { if (!this.connectionOffline()) this.offlineAttentionDismissed.set(false); });
  effect(() => {
   const target = this.params().get('notificationTarget');
   if (this.role !== 'operator' || target !== 'updates') return;
   untracked(() => {
    this.menuOpen.set(false);
    this.updateOpen.set(true);
    void this.router.navigate([], { relativeTo: this.route,
     queryParams: { notificationTarget: null }, queryParamsHandling: 'merge', replaceUrl: true });
   });
  });
  effect(() => {
   const user = this.profiles.activeUserProfile();
   untracked(() => user ? this.notifications.initialize(user.id, user.activities.notifications, user.notificationPreferences?.muted)
    : this.notifications.reset());
  });
  effect(onCleanup => {
   const unregister = untracked(() => this.guide.registerContext('home'));
   onCleanup(unregister);
  });
  effect(onCleanup => {
   if (this.role !== 'member' || this.page() !== 'chat') return;
   const unregister = untracked(() => this.guide.registerContext('chat'));
   onCleanup(unregister);
  });
  effect(onCleanup => {
   if (!this.menuOpen()) return;
   const unregister = untracked(() => this.guide.registerContext('navigation'));
   onCleanup(unregister);
  });
  effect(onCleanup => {
   const id = this.profiles.activeUserId();
   untracked(() => { this.realtimeCursor = null; if (id) this.realtime.restart({ immediate: true }); });
   onCleanup(() => this.realtime.stop({ abort: true }));
  });
 }
 private async hydrateUserAfterLogin(userId: string): Promise<void> {
  const requestVersion = ++this.hydrationRequestVersion;
  this.profiles.setActiveUserId(userId);
  try {
   const session = this.session.currentSession();
   const user = await this.users.loadUserById(session?.kind === 'firebase' ? undefined : userId);
   if (!user || requestVersion !== this.hydrationRequestVersion) return;
   this.profiles.setActiveUserProfile(user);
  } catch {
   // UsersService owns the avatar's error state, as in the native side menu.
  }
 }
 private privacyConsentAccountId(): string {
  if (this.activeUserLoadState().status !== 'success') return '';
  const user = this.users.peekCurrentUser();
  return user?.id === this.profiles.activeUserProfile()?.id ? user?.id?.trim() ?? '' : '';
 }
 private async ensureActivePrivacyConsent(userId: string, revision: GuideRevision, checkKey: string): Promise<void> {
  const requestToken = ++this.privacyConsentCheckToken;
  const isCurrent = () => this.privacyConsentCheckToken === requestToken && this.privacyConsentCheckKey === checkKey;
  try {
   const consent = await this.privacy.loadConsent(userId, revision.id, revision.version);
   if (!isCurrent()) return;
   if (consent?.revisionId === revision.id && consent.revisionVersion >= revision.version) {
    this.profile.clearPrivacyConsentRequirement();
    return;
   }
   const synced = await this.privacy.syncAnonymousEntryConsent(userId, revision);
   if (!isCurrent()) return;
   if (synced) { this.profile.clearPrivacyConsentRequirement(); return; }
  } catch { if (!isCurrent()) return; }
  this.profile.requirePrivacyConsent(checkKey);
  this.profile.openSettingsPopup('privacy');
 }
 protected headerAction(id: string): void {
  if (id === 'notifications') this.openNotifications();
  else if (id === 'explanations') this.guide.toggleEnabled();
  else if (id !== 'settings') void this.selectSetting(id);
 }
 private notificationLauncherAriaLabel(): string {
  const count = Math.max(0, Math.trunc(Number(this.notifications.unreadCount()) || 0));
  if (count > 0) return `Open notifications, ${count} new${this.notifications.muted() ? ', alerts muted' : ''}`;
  return this.notifications.muted() ? 'Open notifications, alerts muted' : 'Open notifications';
 }
 protected openNotifications(event?: Event): void {
  event?.preventDefault();
  event?.stopPropagation();
  if (this.connectionOffline() || this.profiles.activeUserLocationMissing()) return;
  this.menuOpen.set(false);
  this.notifications.open();
 }
 protected dismissNotificationLauncher(): void {
  this.notifications.dismissAttention();
  this.offlineAttentionDismissed.set(true);
 }
 protected changePage(page: string | null): void {
  this.menuOpen.set(false);
  void this.router.navigate([], { relativeTo: this.route, queryParams: { page, chatId: null }, queryParamsHandling: 'merge' });
 }
 protected editProfile(): void { this.menuOpen.set(false); this.editor.begin(); }
 protected async selectSetting(id: string): Promise<void> {
  if (id === 'updates') { this.menuOpen.set(false); this.updateOpen.set(true); return; }
  if (id === 'configuration') { this.menuOpen.set(false); this.configurationOpen.set(true); return; }
  if (id === 'app-setup') { this.menuOpen.set(false); this.setup.open(); return; }
  if (id === 'logout') {
   this.dialogs.open({
    title: 'logout.question', message: this.profiles.activeUserProfile()?.name?.trim() || '',
    cancelLabel: 'Cancel', confirmLabel: 'Logout', confirmTone: 'accent',
    onConfirm: async () => {
     const userId = this.profiles.activeUserId();
     if (userId) {
      const result = await this.users.logoutUser(userId);
      if (!result.submitted) {
       this.dialogs.openInfo(result.message ?? 'Unable to log out.', {
        title: 'Logout', confirmLabel: 'OK', confirmTone: 'neutral'
       });
       return;
      }
     }
     await this.logout();
    }
   });
   return;
  }
  if (id === 'delete-account') {
   this.dialogs.open({
    title: 'Delete account?', message: this.profiles.activeUserProfile()?.name,
    warningMessage: 'You can reactivate within 30 days. After that, the account is permanently purged.',
    cancelLabel: 'Cancel', confirmLabel: 'Delete', confirmTone: 'danger',
    onConfirm: async () => {
     try { await this.users.deleteUser(this.profiles.activeUserId()); }
     catch { this.dialogs.openInfo('Unable to delete account.', { title: 'Delete account', confirmLabel: 'OK', confirmTone: 'danger' }); return; }
     await this.logout();
    }
   });
   return;
  }
  if (id === 'privacy' || id === 'terms' || id === 'help') {
   this.menuOpen.set(false);
   this.profile.openSettingsPopup(id);
   void this.help.preload(id).catch(() => this.dialogs.openInfo('document.load.failed', { title: 'Unable to load content' }));
  }
 }
 protected async logout(): Promise<void> {
  await this.session.logout(); this.profiles.setActiveUserId(''); await this.router.navigateByUrl('/entry');
 }
 ngOnDestroy(): void {
  ++this.hydrationRequestVersion;
  ++this.privacyConsentCheckToken;
  this.setup.close(); this.realtime.destroy(); this.notifications.reset(); this.guide.closePopup();
 }
}
