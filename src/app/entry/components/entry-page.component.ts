import { AppSetupStore } from '../../shared/ui/context/stores/app/app-setup.store';
import { AppSetupPopupComponent } from '../../shared/ui/components/app-setup-popup/app-setup-popup.component';
import { UserProfileStore } from '../../shared/ui/context/stores/profile/user-profile.store';
import { ProfileEditorStore } from '../../shared/ui/context/stores/profile/profile-editor.store';
import { NgComponentOutlet } from '@angular/common';
import { AppLocationService } from '../../shared/core/base/services/accounts/app-location.service';
import type { UserDto } from '../../shared/core/contracts/accounts/user.interface';
import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeploymentBrandComponent, IndicatorComponent, PopupComponent, I18nPipe, DialogStore, ExplanationGuideService, AppMenuComponent, type AppMenuItem } from '@fssrepository/myscoutee-components';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { ExplanationLauncherComponent } from '../../shared/ui/components/explanation-popup/explanation-launcher.component';
import { LandingGuideSurfaceDirective } from './entry-landing/landing-guide-surface.directive';
import { LANDING_EXPLANATION_GUIDE } from '../../shared/core/base/services/help/landing-explanation-guide';
import { EntryFirebaseAuthPopupComponent } from './entry-firebase-auth-popup/entry-firebase-auth-popup.component';
import { DocumentViewerComponent } from '../../shared/ui/components/document-viewer';
import { HelpCenterRevisionDocumentViewerConfigConverter } from '../../shared/ui/converters/app/help-center-revision-document-viewer.converter';
import type { DocumentViewerActionEvent, DocumentViewerConfig } from '../../shared/ui/components/document-viewer';
import type { FirebaseAuthRequestDto, EntryConsentStateDto, EntryConsentAuditRecordDto } from '../../shared/core/contracts/accounts/user.interface';
import { SessionService } from '../../shared/core/base/services/accounts/session.service';
import { FirebaseAppService } from '../../shared/core/base/services/accounts/firebase-app.service';
import { UsersService } from '../../shared/core/base/services/accounts/users.service';
import { PrivacyPolicyService } from '../../shared/core/base/services/help/privacy-policy.service';
import { DeploymentConfigurationService } from '../../shared/core/base/services/platform/deployment-configuration.service';
import { PwaService } from '../../shared/core/base/services/platform/pwa.service';
import { I18nService } from '../../shared/core/base/services/localization/i18n.service';
import { APP_STORAGE_KEYS } from '../../shared/core/common/storage-scope';
import { environment } from '../../../environments/environment';
import { DemoBootstrapSelectorStore } from '../../shared/ui/context/stores/app/demo-bootstrap-selector.store';

@Component({
  selector: 'app-entry-page', standalone: true,
  imports: [DeploymentBrandComponent, AppMenuComponent, MatIconModule, MatRippleModule, AppSetupPopupComponent, NgComponentOutlet, IndicatorComponent, PopupComponent, I18nPipe, EntryFirebaseAuthPopupComponent, DocumentViewerComponent, ExplanationLauncherComponent, LandingGuideSurfaceDirective],
  providers: [{ provide: ExplanationGuideService, useExisting: LANDING_EXPLANATION_GUIDE }],
  templateUrl: './entry-page.component.html', styleUrl: './entry-page.component.scss'
})
export class EntryPageComponent implements OnInit, OnDestroy {
  protected readonly deployment = inject(DeploymentConfigurationService);
  protected readonly pwa = inject(PwaService);
  protected readonly session = inject(SessionService);
  protected readonly privacy = inject(PrivacyPolicyService);
  protected readonly authOpen = signal(false);
  protected readonly consentOpen = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly localMode = environment.activitiesDataSource === 'local';
  protected readonly exploreItems = computed<readonly AppMenuItem[]>(() => [{
    id: 'explore', label: 'explore', icon: 'rocket_launch', kind: 'action',
    layout: 'action', palette: 'brand', disabled: this.busy()
  }]);
  protected readonly setup = inject(AppSetupStore);
  protected readonly editor = inject(ProfileEditorStore);
  private readonly location = inject(AppLocationService);
  private readonly profiles = inject(UserProfileStore);
  private readonly dialogs = inject(DialogStore);
  private readonly firebase = inject(FirebaseAppService);
  private readonly users = inject(UsersService);
  private readonly selector = inject(DemoBootstrapSelectorStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(I18nService);
  private readonly landingGuide = inject(LANDING_EXPLANATION_GUIDE);
  private pendingEntry: 'explore' | 'login' | 'operator' | null = null;
  private preparation: Promise<void> | null = null;
  private readonly privacyLoading = signal(false);

  protected readonly privacyConfig = computed<DocumentViewerConfig>(() => {
    this.i18n.revision();
    return HelpCenterRevisionDocumentViewerConfigConverter.convert({
      revision: this.privacy.activeRevision(), open: this.consentOpen(), shell: 'popup',
      onClose: () => this.closeConsent(), closeOnBackdrop: false,
      titleFallback: this.i18n.translate('Privacy first'), ariaLabel: this.i18n.translate('GDPR consent'),
      loading: this.privacyLoading(), loadingLabel: this.i18n.translate('Loading privacy content'),
      sectionMode: 'privacy', versionLabel: this.privacy.activeVersionLabel(),
      selectedSectionIds: this.privacy.activeRevision() ? this.privacy.loadEntryOptionalApprovals(this.privacy.activeRevision()!) : [],
      actions: [
        { id: 'entry-privacy-reject', label: this.i18n.translate('cancel'), palette: 'slate', disabled: this.busy() },
        { id: 'entry-privacy-accept', label: this.i18n.translate('Accept and continue'),
          icon: this.busy() ? 'hourglass_top' : null, palette: 'blue',
          disabled: this.busy() || !this.privacy.activeRevision(),
          progress: this.busy() ? { state: 'loading', shape: 'button' } : null }
      ],
      statusMessage: this.error(), statusTone: this.error() ? 'error' : 'default'
    });
  });

  ngOnInit(): void {
    this.landingGuide.beginVisit();
    if (environment.firebaseLoginEnabled) void this.firebase.ensureFirebaseRuntime();
    const content = this.prepareContent();
    if (this.session.currentSession() && !this.localMode) {
      this.busy.set(true);
      void content.then(() => this.finishEntry())
        .catch(() => this.error.set('Unable to open selected user.'))
        .finally(() => this.busy.set(false));
    } else {
      void content.catch(() => this.error.set('Privacy content is not available right now.'));
    }
  }

  protected async requestEntry(mode: 'explore' | 'login' | 'operator'): Promise<void> {
    if (this.busy()) return;
    this.error.set('');
    this.pendingEntry = mode;
    this.busy.set(true);
    try {
      await this.prepareContent();
      if (!this.privacy.activeRevision()) throw new Error('Privacy content is not available right now.');
      if (this.hasCurrentConsent()) {
        this.consentOpen.set(false);
        await this.continueEntry();
      } else {
        this.consentOpen.set(true);
      }
    } catch { this.error.set('Privacy content is not available right now.'); }
    finally { this.busy.set(false); }
  }

  protected closeConsent(): void {
    if (this.busy()) return;
    this.pendingEntry = null;
    this.consentOpen.set(false);
  }

  protected async consentAction(event: DocumentViewerActionEvent): Promise<void> {
    if (this.busy()) return;
    const revision = this.privacy.activeRevision();
    if (!revision) return;
    const accepted = event.id === 'entry-privacy-accept';
    if (!accepted && event.id !== 'entry-privacy-reject') return;
    this.busy.set(true);
    try {
      const now = new Date().toISOString();
      const version = `privacy:${this.privacy.revisionKey(revision)}`;
      if (accepted) {
        this.privacy.saveEntryOptionalApprovals(revision, event.selectedSectionIds);
        localStorage.setItem(APP_STORAGE_KEYS.entryConsent, JSON.stringify({ version, accepted: true, acceptedAtIso: now } satisfies EntryConsentStateDto));
      } else localStorage.removeItem(APP_STORAGE_KEYS.entryConsent);
      this.appendConsentAudit({ tsIso: now, action: accepted ? 'accepted' : 'rejected', version, source: 'entry', userAgent: navigator.userAgent });
      this.consentOpen.set(false);
      if (accepted) await this.continueEntry();
      else this.pendingEntry = null;
    } catch { this.error.set('Privacy choices could not be saved.'); }
    finally { this.busy.set(false); }
  }

  protected async authenticate(request: FirebaseAuthRequestDto): Promise<void> {
    const session = await this.session.startAuthSession(request);
    if (!session) return;
    try { this.authOpen.set(false); await this.finishEntry(); }
    catch { this.error.set('Unable to open selected user.'); }
  }

  private async prepareContent(): Promise<void> {
    if (!this.preparation) {
      this.privacyLoading.set(true);
      // DemoBootstrapSelectorComponent owns demo preparation after its first paint.
      this.preparation = this.privacy.prepareOpen().then(() => undefined)
        .finally(() => { this.preparation = null; this.privacyLoading.set(false); });
    }
    return this.preparation;
  }

  private hasCurrentConsent(): boolean {
    const revision = this.privacy.activeRevision();
    try {
      const value = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.entryConsent) ?? 'null') as EntryConsentStateDto | null;
      return !!revision && value?.accepted === true && !!value.acceptedAtIso?.trim()
        && value.version === `privacy:${this.privacy.revisionKey(revision)}`;
    } catch { return false; }
  }

  private appendConsentAudit(entry: EntryConsentAuditRecordDto): void {
    let entries: EntryConsentAuditRecordDto[] = [];
    try { const value: unknown = JSON.parse(localStorage.getItem(APP_STORAGE_KEYS.entryConsentAudit) ?? '[]'); if (Array.isArray(value)) entries = value; } catch { /* Start the audit after an invalid local record. */ }
    localStorage.setItem(APP_STORAGE_KEYS.entryConsentAudit, JSON.stringify([...entries, entry].slice(-100)));
  }

  private async continueEntry(): Promise<void> {
    const mode = this.pendingEntry;
    this.pendingEntry = null;
    if (mode === 'login' || mode === 'operator') {
      if (environment.firebaseLoginEnabled) await this.firebase.ensureFirebaseRuntime();
      else this.session.setFirebaseRuntimeAvailable(false);
      // Match native openEntryOperator: installed operators can sign in before Firebase is configured.
      if (this.session.authMode === 'firebase' || (mode === 'operator' && !this.localMode)) {
        this.authOpen.set(true); return;
      }
    }
    this.selector.openDemoBootstrapSelector({
      mode: mode === 'operator' ? 'operator' : 'member',
      selectableModes: mode === 'operator' ? ['operator'] : ['member', 'admin', 'operator'],
      onSelect: async (userId, selectedMode) => {
        const session = this.localMode ? this.session.startDemoSession(userId) : await this.session.startTrackedDemoSession(userId);
        if (!session) return this.i18n.translate(this.session.firebaseNotice() || 'Unable to open selected demo user.');
        try {
          // Native operator selection enters through the protected operator
          // route; its guard verifies the role and the destination hydrates.
          if (selectedMode === 'operator') return await this.router.navigateByUrl('/operator');
          return await this.finishEntry();
        }
        catch { this.error.set('Unable to open selected user.'); return false; }
      }
    });
  }

  private async finishEntry(): Promise<boolean> {
    const session = this.session.currentSession();
    if (!session) return false;
    if (session.kind === 'operator-bootstrap') return this.router.navigateByUrl('/operator');
    const cachedUser = this.localMode && session.kind === 'demo'
      ? this.users.peekCachedUserById(session.userId) : null;
    const localWorkspaceUser = cachedUser
      && ['/home', '/admin', '/operator'].includes(this.workspaceDestination(cachedUser).split(/[?#]/, 1)[0]);
    // Use the prepared local profile for entry gates. Every workspace loads
    // the profile through the same avatar indicator after navigation.
    let user = localWorkspaceUser ? cachedUser : await this.users.loadUserById(session.kind === 'demo' ? session.userId : undefined);
    if (!user) throw new Error('User not found.');
    // Account consent belongs to the destination in the native entry flow.
    // MCP authorization has no member shell, so it retains its entry check.
    if (this.workspaceDestination(user).split(/[?#]/, 1)[0] === '/mcp/authorize') {
      const revision = this.privacy.activeRevision();
      if (!revision) throw new Error('Consent required.');
      // Saved account choices take precedence over browser entry choices.
      const consent = await this.privacy.loadConsent(user.id, revision.id, revision.version);
      const current = consent?.revisionId === revision.id && consent.revisionVersion >= revision.version;
      if (!current && !await this.privacy.syncAnonymousEntryConsent(user.id, revision)) throw new Error('Consent required.');
    }
    if (user.profileStatus === 'deleted') {
      user = await this.reactivate(user);
      if (!user) return false;
    }
    if (user.profileStatus === 'blocked' || user.profileStatus === 'inactive') {
      await this.cancelEntry();
      this.error.set('This account is not active.');
      return false;
    }
    if (!user.admin && !user.operator && !await this.ensureLocationAllowed(user)) return false;
    if (user.profileStatus === 'onboarding') {
      this.profiles.setActiveUserProfile(user);
      this.editor.begin({ onSaved: saved => this.enterWorkspace(saved).then(() => undefined), onCancel: () => this.cancelEntry() });
      return true;
    }
    return this.enterWorkspace(user);
  }

  private enterWorkspace(user: UserDto): Promise<boolean> {
    return this.router.navigateByUrl(this.workspaceDestination(user));
  }

  private workspaceDestination(user: UserDto): string {
    const redirect = this.route.snapshot.queryParamMap.get('redirect');
    // Keep the native post-login redirect, limited to retained routes.
    const path = redirect?.split(/[?#]/, 1)[0];
    return path && ['/home', '/admin', '/operator', '/mcp/authorize'].includes(path)
      ? redirect! : user.operator ? '/operator' : user.admin ? '/admin' : '/home';
  }

  private async cancelEntry(): Promise<void> {
    this.profiles.setActiveUserId('');
    await this.session.logout();
  }

  private async ensureLocationAllowed(user: UserDto): Promise<boolean> {
    const eligibility = await this.users.checkLocationEligibility(user.locationCoordinates);
    if (eligibility.eligible) return true;
    if (!eligibility.locationRequired) throw new Error(eligibility.message || 'Unavailable in your country');
    const identity = this.session.identity();
    const allowed = await this.setup.requestForLogin(async coordinates => {
      const result = await this.users.checkLocationEligibility(coordinates);
      if (!result.eligible) throw new Error(result.message || 'Unavailable in your country');
      if (identity !== this.session.identity()) return false;
      return this.location.saveCurrentCoordinates(coordinates);
    });
    if (!allowed) await this.cancelEntry();
    return allowed;
  }

  private reactivate(user: UserDto): Promise<UserDto | null> {
    // Same eligibility and status restoration as the native account menu.
    const deletedAtMs = Date.parse(`${user.deletedAtIso ?? ''}`.trim());
    if (Number.isFinite(deletedAtMs) && Date.now() - deletedAtMs > 30 * 24 * 60 * 60 * 1000) {
      return this.cancelEntry().then(() => { this.error.set('This account can no longer be reactivated.'); return null; });
    }
    return new Promise(resolve => {
      this.dialogs.open({
        title: 'Reactivate account?',
        message: this.i18n.translateParams('account.reactivation.message', { productName: this.deployment.branding().productName }),
        cancelLabel: 'Cancel', confirmLabel: 'Reactivate', busyConfirmLabel: 'Reactivating...',
        confirmTone: 'accent', allowBackdropClose: false, allowEscapeClose: false,
        failureMessage: 'Unable to reactivate account.',
        onCancel: async () => { await this.cancelEntry(); resolve(null); },
        onConfirm: async () => {
          const previous = user.previousProfileStatus;
          const profileStatus = previous && ['blocked', 'friends only', 'host only', 'inactive', 'public'].includes(previous) ? previous : 'public';
          const saved = await this.users.saveUserProfile({ ...user, profileStatus, previousProfileStatus: null, deletedAtIso: null });
          if (!saved) throw new Error('Unable to reactivate account.');
          resolve(saved);
        }
      });
    });
  }

  ngOnDestroy(): void { this.setup.close(); }
}
