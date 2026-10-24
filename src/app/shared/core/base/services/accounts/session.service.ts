import { OfflineCacheService } from '../platform/offline-cache.service';
import { endDemoFailoverSession, prewarmDemoFailover } from '../../../common/demo-failover';
import { Injectable, Injector, computed, inject, signal } from '@angular/core';

import { environment } from '../../../../../../environments/environment';
import type { AccountAuthProfileDto, FirebaseAuthRequestDto } from '../../../contracts/accounts/user.interface';
import type { AuthMode } from '../../../common/constants';
import { APP_STORAGE_KEYS } from '../../../common/storage-scope';
import { secureRandomUuid } from '../../../common/secure-random';
import {
  isFirebaseLoginEnabled,
  resolveRuntimeAuthMode
} from '../../../common/firebase-login-mode';

type FirebaseAuthServiceInstance = import('./firebase-auth.service').FirebaseAuthService;
type HttpSessionRegistryServiceInstance =
  import('../../../http/services/accounts/session-registry.service').HttpSessionRegistryService;

export interface SupportSessionContext {
  kind: 'admin-support';
  targetUrl?: string;
}

export const AVATAR_PREVIEW_MAX_BYTES = 64 * 1024;

function avatarPreviewDataUrl(value: unknown): string | undefined {
  return typeof value === 'string'
    && value.length <= Math.ceil(AVATAR_PREVIEW_MAX_BYTES / 3) * 4 + 32
    && /^data:image\/(?:webp|png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)
    ? value : undefined;
}

export type AppSession =
  | { kind: 'demo'; userId: string; sessionId?: string; supportContext?: SupportSessionContext }
  | { kind: 'authenticated'; profile: AccountAuthProfileDto; sessionId: string; accessToken: string; expiresAt: string; avatarImageUrl?: string; avatarImageDataUrl?: string };

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private static readonly SESSION_STORAGE_KEY = APP_STORAGE_KEYS.session;
  private static readonly ADMIN_SUPPORT_SESSION_KEY = APP_STORAGE_KEYS.adminSupportSession;
  private static readonly DEMO_ACTIVE_USER_KEY = APP_STORAGE_KEYS.demoActiveUser;

  private readonly injector = inject(Injector);
  private readonly offlineCache = inject(OfflineCacheService);
  private cacheClear: Promise<void> = Promise.resolve();
  private readonly sessionRef = signal<AppSession | null>(this.loadStoredSession());
  private readonly authModeRef = signal<AuthMode>('selector');
  private readonly authBusyRef = signal(false);
  private readonly authNoticeRef = signal('');
  private firebaseAuthServicePromise: Promise<FirebaseAuthServiceInstance> | null = null;
  private sessionRegistryServicePromise:
    Promise<HttpSessionRegistryServiceInstance> | null = null;

  readonly session = this.sessionRef.asReadonly();
  readonly authBusy = this.authBusyRef.asReadonly();
  readonly authNotice = this.authNoticeRef.asReadonly();
  readonly accountProfile = computed(() => {
    const current = this.sessionRef();
    return current?.kind === 'authenticated' ? current.profile : null;
  });
  readonly activeUserId = computed(() => {
    const current = this.sessionRef();
    if (current?.kind === 'demo') {
      return current.userId.trim();
    }
    if (current?.kind === 'authenticated') {
      return current.profile.id.trim();
    }
    return '';
  });
  // Avatar previews and token restoration may replace the object within one session.
  readonly identity = computed(() => {
    const session = this.sessionRef();
    if (!session) return null;
    return JSON.stringify([session.kind, session.kind === 'authenticated' ? session.profile.id : session.userId,
          session.sessionId, session.kind === 'demo' ? session.supportContext : undefined]);
  });

  get authMode(): AuthMode {
    return this.authModeRef();
  }

  setFirebaseRuntimeAvailable(available: boolean): void {
    this.authModeRef.set(resolveRuntimeAuthMode(
      isFirebaseLoginEnabled(),
      available
    ));
  }

  currentSession(): AppSession | null {
    return this.sessionRef();
  }

  setSessionAvatarPreview(sessionId: string, imageUrl: string): void {
    const session = this.sessionRef();
    if (session?.kind !== 'authenticated' || session.sessionId !== sessionId) {
      return;
    }
    const source = imageUrl.trim();
    if (session.avatarImageUrl === source) {
      return;
    }
    this.persistSession({ ...session, avatarImageUrl: source, avatarImageDataUrl: undefined });
  }

  setSessionAvatarPreviewData(sessionId: string, imageUrl: string, dataUrl: string): void {
    const session = this.sessionRef();
    const imageData = avatarPreviewDataUrl(dataUrl);
    if (session?.kind !== 'authenticated' || session.sessionId !== sessionId
      || session.avatarImageUrl !== imageUrl || !imageData) {
      return;
    }
    this.persistSession({ ...session, avatarImageDataUrl: imageData });
  }

  async ensureSession(): Promise<AppSession | null> {
    const current = this.sessionRef();
    if (current?.kind === 'authenticated' && !this.isFutureIso(current.expiresAt)) {
      this.rejectSession(current.sessionId);
      return null;
    }
    return current;
  }

  startDemoSession(
    userId: string,
    options: { supportContext?: SupportSessionContext } = {}
  ): AppSession | null {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      return null;
    }
    const supportContext = this.normalizeSupportContext(options.supportContext);
    const session: Extract<AppSession, { kind: 'demo' }> = {
      kind: 'demo',
      userId: normalizedUserId,
      sessionId: this.newOpaqueId('session'),
      supportContext
    };
    if (supportContext) {
      return this.persistAdminSupportSession(session) ? session : null;
    }
    localStorage.setItem(SessionService.DEMO_ACTIVE_USER_KEY, normalizedUserId);
    this.persistSession(session);
    return session;
  }

  async startTrackedDemoSession(
    userId: string,
    options: { supportContext?: SupportSessionContext } = {}
  ): Promise<AppSession | null> {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      return null;
    }
    const supportContext = this.normalizeSupportContext(options.supportContext);
    const current = this.sessionRef();
    const currentSessionId = current?.kind === 'demo'
      && !current.supportContext
      && !supportContext
      && current.userId.trim() === normalizedUserId
      ? `${current.sessionId ?? ''}`.trim()
      : '';
    const session: Extract<AppSession, { kind: 'demo' }> & { sessionId: string } = {
      kind: 'demo',
      userId: normalizedUserId,
      sessionId: currentSessionId || this.newOpaqueId('session'),
      supportContext
    };
    try {
      const response = await (await this.sessionRegistryService()).registerDemoLogin(
        session.sessionId,
        session.userId,
        {
          attemptId: this.newOpaqueId('attempt'),
          provider: 'demo'
        }
      );
      if (response.accepted) {
        if (supportContext) {
          return this.persistAdminSupportSession(session) ? session : null;
        }
        localStorage.setItem(SessionService.DEMO_ACTIVE_USER_KEY, normalizedUserId);
        this.persistSession(session);
        return session;
      }
      this.authNoticeRef.set('auth.session.limit.reached');
    } catch (error) {
      this.authNoticeRef.set(
        this.httpErrorStatus(error) === 409
          ? 'auth.session.limit.reached'
          : 'auth.session.registration.failed'
      );
    }
    return null;
  }

  async cancelFirebaseAccountLink(): Promise<void> {
    if (this.firebaseAuthServicePromise && !this.authBusyRef()) {
      (await this.firebaseAuthServicePromise).cancelAccountLink();
      this.authNoticeRef.set('');
    }
  }

  async startAuthSession(request: FirebaseAuthRequestDto = { provider: 'google' }): Promise<AppSession | null> {
    if (this.authBusyRef()) return null;
    this.authBusyRef.set(true);
    this.authNoticeRef.set('');
    try {
      if (request.provider === 'email' && request.emailMode === 'sign-in') {
        try {
          const response = await (await this.sessionRegistryService()).registerPasswordLogin(
            this.reusableSessionId({ email: request.email ?? '' }) || this.newOpaqueId('session'),
            { attemptId: this.newOpaqueId('attempt'), provider: 'password',
              email: request.email?.trim(), password: request.password }
          );
          if (!response.accepted) {
            this.authNoticeRef.set('auth.session.limit.reached');
            return null;
          }
          const session = this.sessionFromResponse(response);
          if (!session) return null;
          this.persistSession(session);
          void this.initializeFirebaseMessagingForSession(session);
          return session;
        } catch (error) {
          if (this.httpErrorStatus(error) !== 404) {
            this.authNoticeRef.set(this.httpErrorStatus(error) === 429
              ? 'auth.session.login.throttled' : 'auth.session.login.failed');
            return null;
          }
        }
      }
      return await this.startFirebaseSessionInternal(request);
    } finally {
      this.authBusyRef.set(false);
    }
  }

  async restoreAuthSession(): Promise<AppSession | null> {
    if (this.sessionRef()?.kind === 'authenticated') return this.ensureSession();
    if (this.authBusyRef()) {
      return this.sessionRef();
    }
    const current = this.sessionRef();
    if (current?.kind === 'authenticated' && this.isBrowserOffline()) {
      return current;
    }
    this.authBusyRef.set(true);
    this.authNoticeRef.set('');
    try {
      const profile = await (await this.firebaseAuthService()).restoreSessionProfile();
      if (!profile) {
        this.clearStoredSession();
        return null;
      }
      const session: AppSession = {
        kind: 'authenticated',
        accessToken: '', expiresAt: '',
        profile,
        sessionId: this.reusableSessionId(profile) || this.newOpaqueId('session')
      };
      if (!await this.registerFirebaseLogin(session, 'firebase')) {
        return null;
      }
      this.persistSession(session);
      void this.initializeFirebaseMessagingForSession(session);
      return session;
    } catch (error) {
      if (current?.kind === 'authenticated' && this.isFirebaseNetworkError(error)) return current;
      throw error;
    } finally {
      this.authBusyRef.set(false);
    }
  }

  async logout(): Promise<void> {
    const current = this.sessionRef();
    const adminSupportSession = this.isAdminSupportSession(current);
    if (current?.kind === 'demo' && !adminSupportSession) endDemoFailoverSession();
    const sessionRegistryEnabled = environment.activitiesDataSource === 'http';

    this.authNoticeRef.set('');
    this.clearStoredSession();
    await this.cacheClear;
    if (!adminSupportSession && typeof localStorage !== 'undefined') {
      localStorage.removeItem(SessionService.DEMO_ACTIVE_USER_KEY);
    }
    if (sessionRegistryEnabled) {
      try {
        const sessionId = current?.kind === 'demo' || current?.kind === 'authenticated'
          ? `${current.sessionId ?? ''}`.trim()
          : '';
        if (current?.kind === 'demo' && sessionId) {
          await (await this.sessionRegistryService()).revokeDemoSession(
            sessionId,
            current.userId
          );
        } else if (current?.kind === 'authenticated' && sessionId && current.accessToken) {
          await (await this.sessionRegistryService()).revokeSession(
            sessionId,
            current.profile.id,
            current.accessToken
          );
        }
      } catch {
        // Keep logout resilient when the registry is offline or already revoked.
      }
    }
    if (this.firebaseAuthServicePromise) {
      await (await this.firebaseAuthServicePromise).signOut();
    }
  }

  async getAccessToken(): Promise<string | null> {
    const session = await this.ensureSession();
    return session?.kind === 'authenticated' ? session.accessToken : null;
  }

  currentSessionId(): string {
    return this.sessionRef()?.sessionId?.trim() ?? '';
  }

  rejectSession(sessionId: string): boolean {
    if (!sessionId || this.sessionRef()?.sessionId !== sessionId) return false;
    this.clearStoredSession();
    return true;
  }

  private async firebaseAuthService(): Promise<FirebaseAuthServiceInstance> {
    if (!this.firebaseAuthServicePromise) {
      this.firebaseAuthServicePromise = import('./firebase-auth.service')
        .then(module => this.injector.get(module.FirebaseAuthService));
    }
    return this.firebaseAuthServicePromise;
  }

  private async sessionRegistryService():
    Promise<HttpSessionRegistryServiceInstance> {
    if (!this.sessionRegistryServicePromise) {
      this.sessionRegistryServicePromise = import(
        '../../../http/services/accounts/session-registry.service'
      ).then(module => this.injector.get(module.HttpSessionRegistryService));
    }
    return this.sessionRegistryServicePromise;
  }

  private async startFirebaseSessionInternal(
    request: FirebaseAuthRequestDto
  ): Promise<AppSession | null> {
    const result = await (await this.firebaseAuthService()).signIn(request);
    if (result.emailVerificationSent) {
      const email = result.email?.trim();
      this.authNoticeRef.set(email
        ? `Verification email sent to ${email}. Confirm it, then continue here.`
        : 'Verification email sent. Confirm it, then continue here.');
      return null;
    }
    if (result.errorMessage) {
      this.authNoticeRef.set(result.errorMessage);
      return null;
    }
    if (!result.profile) {
      return null;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(SessionService.DEMO_ACTIVE_USER_KEY);
    }
    const session: AppSession = {
      kind: 'authenticated',
      accessToken: '', expiresAt: '',
      profile: result.profile,
      sessionId: this.reusableSessionId(result.profile) || this.newOpaqueId('session')
    };
    if (!await this.registerFirebaseLogin(session, request.provider)) {
      return null;
    }
    this.persistSession(session);
    void this.initializeFirebaseMessagingForSession(session);
    return session;
  }

  private async initializeFirebaseMessagingForSession(session: AppSession): Promise<void> {
    if (environment.activitiesDataSource === 'http' && (session.kind !== 'authenticated'
      || !environment.firebaseMessagingEnabled || !environment.serviceWorkerEnabled)) {
      return;
    }
    const { FirebaseMessagingService } = await import('../notifications/firebase-messaging.service');
    this.injector.get(FirebaseMessagingService).initialize();
  }

  private async registerFirebaseLogin(
    session: Extract<AppSession, { kind: 'authenticated' }>,
    provider: string
  ): Promise<boolean> {
    const token = await (await this.firebaseAuthService()).getIdToken();
    if (!token) {
      this.authNoticeRef.set('auth.session.registration.failed');
      await (await this.firebaseAuthService()).signOut();
      return false;
    }
    try {
      const response = await (await this.sessionRegistryService()).registerLogin(
        session.sessionId,
        token,
        {
          attemptId: this.newOpaqueId('attempt'),
          provider
        }
      );
      if (response.accepted) {
        const authenticated = this.sessionFromResponse(response);
        if (authenticated) {
          Object.assign(session, authenticated);
          return true;
        }
        return false;
      }
      this.authNoticeRef.set('auth.session.limit.reached');
    } catch (error) {
      this.authNoticeRef.set(
        this.httpErrorStatus(error) === 409
          ? 'auth.session.limit.reached'
          : 'auth.session.registration.failed'
      );
    }
    await (await this.firebaseAuthService()).signOut();
    return false;
  }

  private persistSession(session: AppSession): void {
    const nextId = session.kind === 'demo' ? session.userId : session.kind === 'authenticated' ? session.profile.id : '';
    const previousId = this.activeUserId();
    if (previousId && previousId !== nextId) this.cacheClear = this.offlineCache.clearUser(previousId);
    if (nextId) this.offlineCache.activateUser(nextId);
    this.clearAdminSupportSessionStorage();
    this.sessionRef.set(session);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SessionService.SESSION_STORAGE_KEY, JSON.stringify(session));
    }
    if (session.kind === 'demo' && !session.supportContext) prewarmDemoFailover();
  }

  private reusableSessionId(profile: Pick<AccountAuthProfileDto, 'email'>): string {
    const current = this.sessionRef();
    if (current?.kind !== 'authenticated') {
      return '';
    }
    const currentEmail = current.profile.email.trim().toLowerCase();
    const nextEmail = profile.email.trim().toLowerCase();
    return currentEmail && currentEmail === nextEmail
      ? current.sessionId.trim()
      : '';
  }

  private clearStoredSession(): void {
    const adminSupportSession = this.isAdminSupportSession(this.sessionRef());
    this.cacheClear = this.offlineCache.clearUser(this.activeUserId());
    this.sessionRef.set(null);
    this.clearAdminSupportSessionStorage();
    if (!adminSupportSession && typeof localStorage !== 'undefined') {
      localStorage.removeItem(SessionService.SESSION_STORAGE_KEY);
    }
  }

  private isLoopbackBrowserHost(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    const hostname = window.location.hostname.toLowerCase();
    return hostname === 'localhost'
      || hostname === '127.0.0.1'
      || hostname === '[::1]'
      || hostname === '::1'
      || hostname.endsWith('.localhost');
  }

  private isBrowserOffline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine === false;
  }

  private isFirebaseNetworkError(error: unknown): boolean {
    return (error as { code?: string } | null)?.code === 'auth/network-request-failed';
  }

  private loadStoredSession(): AppSession | null {
    const adminSupportSession = this.loadStoredAdminSupportSession();
    if (adminSupportSession) {
      return adminSupportSession;
    }

    if (typeof localStorage === 'undefined') {
      return null;
    }
    const raw = localStorage.getItem(SessionService.SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<AppSession>;
      if (parsed.kind === 'demo' && typeof parsed.userId === 'string' && parsed.userId.trim().length > 0) {
        return {
          kind: 'demo',
          userId: parsed.userId.trim(),
          sessionId: typeof parsed.sessionId === 'string'
            ? parsed.sessionId.trim() || undefined
            : undefined,
          supportContext: this.normalizeSupportContext(
            (parsed as { supportContext?: Partial<SupportSessionContext> }).supportContext
          )
        };
      }
      if (
        parsed.kind === 'authenticated' &&
        typeof parsed.accessToken === 'string' && !!parsed.accessToken &&
        typeof parsed.expiresAt === 'string' && this.isFutureIso(parsed.expiresAt) &&
        parsed.profile &&
        typeof parsed.sessionId === 'string' &&
        parsed.sessionId.trim().length > 0 &&
        typeof parsed.profile.id === 'string' &&
        typeof parsed.profile.name === 'string' &&
        typeof parsed.profile.email === 'string' &&
        typeof parsed.profile.initials === 'string'
      ) {
        return {
          kind: 'authenticated',
          accessToken: parsed.accessToken, expiresAt: parsed.expiresAt,
          sessionId: parsed.sessionId.trim(),
          avatarImageUrl: typeof parsed.avatarImageUrl === 'string' ? parsed.avatarImageUrl : undefined,
          avatarImageDataUrl: avatarPreviewDataUrl(parsed.avatarImageDataUrl),
          profile: {
            id: parsed.profile.id,
            name: parsed.profile.name,
            email: parsed.profile.email,
            initials: parsed.profile.initials,
            imageUrl: typeof parsed.profile.imageUrl === 'string' ? parsed.profile.imageUrl : undefined
          }
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  private persistAdminSupportSession(
    session: Extract<AppSession, { kind: 'demo' }>
  ): boolean {
    if (!this.isAdminSupportSession(session) || typeof sessionStorage === 'undefined') {
      return false;
    }
    try {
        sessionStorage.setItem(
        SessionService.ADMIN_SUPPORT_SESSION_KEY,
        JSON.stringify(session)
      );
      this.sessionRef.set(session);
      return true;
    } catch {
      this.clearAdminSupportSessionStorage();
      return false;
    }
  }

  private loadStoredAdminSupportSession():
    Extract<AppSession, { kind: 'demo' }> | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    try {
      const rawSession = sessionStorage.getItem(
        SessionService.ADMIN_SUPPORT_SESSION_KEY
      );
      if (!rawSession) {
        return null;
      }
      const parsed = JSON.parse(rawSession) as Partial<
        Extract<AppSession, { kind: 'demo' }>
      >;
      const userId = `${parsed.userId ?? ''}`.trim();
      const supportContext = this.normalizeSupportContext(parsed.supportContext);
      if (parsed.kind !== 'demo' || !userId || !supportContext) {
        this.clearAdminSupportSessionStorage();
        return null;
      }
      return {
        kind: 'demo',
        userId,
        sessionId: typeof parsed.sessionId === 'string'
          ? parsed.sessionId.trim() || undefined
          : undefined,
        supportContext
      };
    } catch {
      this.clearAdminSupportSessionStorage();
      return null;
    }
  }

  private clearAdminSupportSessionStorage(): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    try {
      sessionStorage.removeItem(SessionService.ADMIN_SUPPORT_SESSION_KEY);
    } catch {
      // Clearing a blocked browser storage area is best effort.
    }
  }

  private isAdminSupportSession(
    session: AppSession | null | undefined
  ): boolean {
    return session?.kind === 'demo'
      && session.supportContext?.kind === 'admin-support';
  }

  private sessionFromResponse(response: import('../../../contracts/accounts/user.interface').UserSessionLoginResponseDto): Extract<AppSession, { kind: 'authenticated' }> | null {
    const session = response.session;
    if (!response.accepted || !session?.accessToken || !session.sessionId
      || !session.profile?.id || !this.isFutureIso(session.expiresAt)) {
      this.authNoticeRef.set('auth.session.registration.failed');
      return null;
    }
    return { kind: 'authenticated', ...session };
  }

  private isFutureIso(value: string): boolean {
    const expiresAtMs = Date.parse(value);
    return Number.isFinite(expiresAtMs) && expiresAtMs > Date.now();
  }

  private httpErrorStatus(error: unknown): number | null {
    if (!error || typeof error !== 'object' || !('status' in error)) {
      return null;
    }
    const status = Number((error as { status?: unknown }).status);
    return Number.isFinite(status) ? status : null;
  }

  private newOpaqueId(prefix: 'session' | 'attempt'): string {
    return `${prefix}:${secureRandomUuid()}`;
  }

  private normalizeSupportContext(
    context: Partial<SupportSessionContext> | null | undefined
  ): SupportSessionContext | undefined {
    if (context?.kind !== 'admin-support') {
      return undefined;
    }
    const targetUrl = `${context.targetUrl ?? ''}`.trim();
    return {
      kind: 'admin-support',
      targetUrl: targetUrl || undefined
    };
  }
}
