import {OperatorUpdateService} from '../../../../core/base/services/operator/operator-update.service';
import {PwaService} from '../../../../core/base/services/platform/pwa.service';
import type {OperatorDeploymentUpdatePhase,OperatorDeploymentUpdateProgressDto,OperatorDeploymentUpdateProgressHandler,OperatorRollbackDto,OperatorDeploymentUpdateDto} from '../../../../core/contracts/operator/operator-update.interface';
import type {OperatorTlsCertificateMode,OperatorTlsTestKind,OperatorTlsJobPhase,OperatorTlsConfigurationDto,OperatorTlsConfigurationUpdateDto,OperatorTlsTestRequestDto,OperatorTlsJobDto} from '../../../../core/contracts/operator/operator.interface';
import {Injectable,computed,effect,inject,signal} from '@angular/core';
import {DeploymentConfigurationService} from '../../../../core/base/services/platform/deployment-configuration.service';
import {FirebaseAppService} from '../../../../core/base/services/accounts/firebase-app.service';
import {FirebaseMessagingService,type FirebaseMessagingReadinessLease} from '../../../../core/base/services/notifications/firebase-messaging.service';
import {OperatorConfigurationService} from '../../../../core/base/services/operator/operator-configuration.service';
import {OperatorConfigurationMapper} from '../../../../core/base/mappers/operator/operator-configuration.mapper';
import {SessionService,type AppSession} from '../../../../core/base/services/accounts/session.service';
import {UserProfileStore} from '../profile/user-profile.store';
import type {OperatorConfigurationDto,OperatorConfigurationSaveRequestDto,OperatorConfigurationTestKind,OperatorConfigurationTestResultDto} from '../../../../core/contracts/operator/operator.interface';
export type OperatorWorkspaceBusyAction="load-configuration"|"save-branding"|"save-admin-emails"|"save-privacy-contact"|"save-social-links"|"save-integration"|"register-firebase"|"activate-firebase"|"test-authentication"|"test-messaging"|"save-tls"|"test-tls-domain"|"test-tls-certificate"|"load-update"|"apply-update"|"rollback-update"|null;
export type OperatorConfigurationTestFeedback='success'|'error'|null;
const CONFIGURATION_BUSY_ACTIONS=new Set<Exclude<OperatorWorkspaceBusyAction,null>>(["load-configuration","save-branding","save-admin-emails","save-privacy-contact","save-social-links","save-integration","register-firebase","activate-firebase","test-authentication","test-messaging","save-tls","test-tls-domain","test-tls-certificate"]);
@Injectable({providedIn:'root'})
export class OperatorWorkspaceStore {
 private readonly updateService=inject(OperatorUpdateService);
  private readonly service = inject(OperatorConfigurationService);

  private readonly sessionService = inject(SessionService);

  private readonly userProfileStore = inject(UserProfileStore);

  private readonly deploymentConfiguration = inject(DeploymentConfigurationService);

  private readonly firebaseAppService = inject(FirebaseAppService);

  private readonly firebaseMessagingService = inject(FirebaseMessagingService);

  private readonly configurationRef = signal<OperatorConfigurationDto | null>(null);

  private readonly configurationDraftRef =
    signal<OperatorConfigurationSaveRequestDto | null>(null);

  private readonly configurationAdminEmailsInputRef = signal('');

  private readonly configurationAuthenticationTestRef =
    signal<OperatorConfigurationTestResultDto | null>(null);

  private readonly configurationMessagingTestRef =
    signal<OperatorConfigurationTestResultDto | null>(null);

  private readonly configurationMessagingDestinationTokenRef = signal('');

  private readonly configurationAuthenticationFeedbackRef =
    signal<OperatorConfigurationTestFeedback>(null);

  private readonly configurationMessagingFeedbackRef =
    signal<OperatorConfigurationTestFeedback>(null);

  private readonly busyActionRef = signal<OperatorWorkspaceBusyAction>(null);

  private readonly errorRef = signal('');

  private readonly noticeRef = signal('');

  private readonly feedbackActionRef =
    signal<Exclude<OperatorWorkspaceBusyAction, null> | null>(null);

  private requestGeneration = 0;

  private configurationAuthenticationFeedbackTimer:
    ReturnType<typeof setTimeout> | null = null;

  private configurationMessagingFeedbackTimer:
    ReturnType<typeof setTimeout> | null = null;

  private configurationLifecycleGeneration = 0;

  private contextKey = this.sessionKey(this.sessionService.currentSession());

  readonly configuration = this.configurationRef.asReadonly();

  readonly configurationDraft = this.configurationDraftRef.asReadonly();

  readonly configurationAdminEmailsInput =
    this.configurationAdminEmailsInputRef.asReadonly();

  readonly configurationAuthenticationTest =
    this.configurationAuthenticationTestRef.asReadonly();

  readonly configurationMessagingTest =
    this.configurationMessagingTestRef.asReadonly();

  readonly configurationMessagingDestinationToken =
    this.configurationMessagingDestinationTokenRef.asReadonly();

  readonly configurationAuthenticationFeedback =
    this.configurationAuthenticationFeedbackRef.asReadonly();

  readonly configurationMessagingFeedback =
    this.configurationMessagingFeedbackRef.asReadonly();

  readonly busyAction = this.busyActionRef.asReadonly();

  readonly error = this.errorRef.asReadonly();

  readonly notice = this.noticeRef.asReadonly();

  readonly feedbackAction = this.feedbackActionRef.asReadonly();

  readonly configurationUploadOwnerId = computed(() => {
    const session = this.sessionService.currentSession();
    return this.userProfileStore.activeUserProfile()?.id?.trim()
      || (session?.kind === 'demo' ? session.userId.trim() : '')
      || 'operator-branding';
  });

  readonly configurationFirebaseDirty = computed(() => {
    const configuration = this.configurationRef();
    const draft = this.configurationDraftRef();
    if (!configuration || !draft || configuration.capability !== 'AVAILABLE') {
      return false;
    }
    return (
      draft.firebase.projectId.trim() !== configuration.firebase.projectId
      || draft.firebase.apiKey.trim()
        !== configuration.firebase.publicConfiguration.apiKey
      || draft.firebase.authDomain.trim()
        !== configuration.firebase.publicConfiguration.authDomain
      || draft.firebase.storageBucket.trim()
        !== configuration.firebase.publicConfiguration.storageBucket
      || draft.firebase.messagingSenderId.trim()
        !== configuration.firebase.publicConfiguration.messagingSenderId
      || draft.firebase.appId.trim()
        !== configuration.firebase.publicConfiguration.appId
      || draft.firebase.measurementId.trim()
        !== (configuration.firebase.publicConfiguration.measurementId ?? '')
      || draft.firebase.vapidKey.trim()
        !== (configuration.firebase.publicConfiguration.vapidKey ?? '')
      || Boolean(draft.firebase.authenticationCredential.trim())
      || Boolean(draft.firebase.messagingCredential.trim())
    );
  });

  readonly configurationDirty = computed(() => {
    const configuration = this.configurationRef();
    const draft = this.configurationDraftRef();
    if (!configuration || !draft || configuration.capability !== 'AVAILABLE') {
      return false;
    }
    return (
      draft.branding.productName.trim() !== configuration.branding.productName
      || draft.branding.logoUrl.trim() !== configuration.branding.logoUrl
      || draft.branding.logoCharacterIndex
        !== configuration.branding.logoCharacterIndex

      || !OperatorConfigurationMapper.adminEmailsEqual(
        draft.adminEmails,
        configuration.adminEmails
      )
      || draft.privacyContact.dataControllerName.trim()
        !== configuration.privacyContact.dataControllerName
      || draft.privacyContact.privacyContactEmail.trim().toLowerCase()
        !== configuration.privacyContact.privacyContactEmail
      || !OperatorConfigurationMapper.socialLinksEqual(
        draft.socialLinks,
        configuration.socialLinks
      )
      || (draft.integration?.publicBaseUrl ?? '').trim()
        !== (configuration.integration?.publicBaseUrl ?? '')
      || this.configurationFirebaseDirty()
    );
  });

  readonly configurationBrandingReady = computed(() => {
    const draft = this.configurationDraftRef();
    if (!draft?.branding.productName.trim()) {
      return false;
    }
    const index = draft.branding.logoCharacterIndex;
    return index === null
      || (
        Number.isInteger(index)
        && index >= -1
        && index < Array.from(draft.branding.productName.trim()).length
      );
  });

  readonly configurationAdminEmailsValidationKey = computed(() =>
    OperatorConfigurationMapper.adminEmailValidationKey(
      this.configurationAdminEmailsInputRef()
    )
  );

  readonly configurationAdminEmailsReady = computed(
    () => this.configurationAdminEmailsValidationKey() === null
  );

  readonly configurationPrivacyContactValidationKey = computed(() =>
    OperatorConfigurationMapper.privacyContactValidationKey(
      this.configurationDraftRef()?.privacyContact
    )
  );

  readonly configurationPrivacyContactReady = computed(
    () => this.configurationPrivacyContactValidationKey() === null
  );

  readonly configurationSocialLinksValidationKey = computed(() =>
    OperatorConfigurationMapper.socialLinksValidationKey(
      this.configurationDraftRef()?.socialLinks ?? []
    )
  );

  readonly configurationSocialLinksReady = computed(
    () => this.configurationSocialLinksValidationKey() === null
  );

  readonly configurationIntegrationValidationKey = computed(() =>
    OperatorConfigurationMapper.integrationValidationKey(
      this.configurationDraftRef()?.integration
    )
  );

  readonly configurationIntegrationReady = computed(
    () => this.configurationIntegrationValidationKey() === null
  );

  constructor() {
    effect(() => {
      const nextContextKey = this.sessionKey(this.sessionService.session());
      if (nextContextKey === this.contextKey) {
        return;
      }
      this.contextKey = nextContextKey;
      this.reset();
    });
  }

  async loadConfiguration(): Promise<OperatorConfigurationDto | null> {
    const result = await this.run(
      'load-configuration',
      async () => {
        const [configuration, tlsConfiguration] = await Promise.all([
          this.service.loadConfiguration(),
          Promise.resolve()
            .then(() => this.service.loadTlsConfiguration())
            .catch(() => null)
        ]);
        return { configuration, tlsConfiguration };
      }
    );
    if (result) {
      this.configurationRef.set(result.configuration);
      this.configurationDraftRef.set(
        this.configurationDraftFrom(result.configuration)
      );
      this.configurationAdminEmailsInputRef.set(
        OperatorConfigurationMapper.adminEmailInput(
          result.configuration.adminEmails
        )
      );
      this.deploymentConfiguration.applyBranding(result.configuration.branding);
      this.deploymentConfiguration.applySocialLinks(
        result.configuration.socialLinks
      );
      this.deploymentConfiguration.applyPrivacyContact(
        result.configuration.privacyContact
      );
      if (result.tlsConfiguration) {
        this.tlsConfigurationRef.set(result.tlsConfiguration);
        this.tlsConfigurationDraftRef.set(
          this.tlsDraftFrom(result.tlsConfiguration)
        );
      }
    }
    return result?.configuration ?? null;
  }

  async saveConfiguration(
    action:
      | 'save-branding'
      | 'save-admin-emails'
      | 'save-privacy-contact'
      | 'save-social-links'
      | 'save-integration'
      | 'register-firebase',
    noticeKey = 'operator.configuration.saved'
  ): Promise<OperatorConfigurationDto | null> {
    const configuration = this.configurationRef();
    const draft = this.configurationDraftRef();
    const firebaseChanged = this.configurationFirebaseDirty();
    if (
      !configuration
      || configuration.capability !== 'AVAILABLE'
      || !draft
    ) {
      this.errorRef.set(
        configuration?.unavailableReason
        || 'operator.configuration.backend.unavailable'
      );
      return null;
    }
    const adminEmailValidationKey =
      this.configurationAdminEmailsValidationKey();
    if (adminEmailValidationKey) {
      this.feedbackActionRef.set(action);
      this.errorRef.set(adminEmailValidationKey);
      return null;
    }
    const socialLinkValidationKey =
      this.configurationSocialLinksValidationKey();
    if (socialLinkValidationKey) {
      this.feedbackActionRef.set(action);
      this.errorRef.set(socialLinkValidationKey);
      return null;
    }
    const privacyContactValidationKey =
      this.configurationPrivacyContactValidationKey();
    if (privacyContactValidationKey) {
      this.feedbackActionRef.set(action);
      this.errorRef.set(privacyContactValidationKey);
      return null;
    }
    if (action === 'save-integration') {
      const integrationValidationKey =
        this.configurationIntegrationValidationKey();
      if (integrationValidationKey) {
        this.feedbackActionRef.set(action);
        this.errorRef.set(integrationValidationKey);
        return null;
      }
    }
    const result = await this.run(
      action,
      async () => {
        try {
          return await this.service.saveConfiguration({
            ...structuredClone(draft),
            integration: {
              publicBaseUrl:
                OperatorConfigurationMapper.publicBaseUrl(
                  draft.integration?.publicBaseUrl
                ) || `${draft.integration?.publicBaseUrl ?? ''}`.trim()
            },
            socialLinks: OperatorConfigurationMapper.socialLinks(
              draft.socialLinks
            )
          });
        } finally {
          /*
           * The server may have committed the new revision even when the
           * popup closes or the response is lost. Reconcile the owned client
           * app independently from whether this popup may still consume the
           * response.
           */
          if (firebaseChanged) {
            await this.firebaseAppService.refreshFirebaseApp();
          }
        }
      }
    );
    if (result) {
      this.configurationRef.set(result);
      this.configurationDraftRef.set(this.configurationDraftFrom(result));
      this.configurationAdminEmailsInputRef.set(
        OperatorConfigurationMapper.adminEmailInput(result.adminEmails)
      );
      this.configurationAuthenticationTestRef.set(null);
      this.configurationMessagingTestRef.set(null);
      this.clearConfigurationTestFeedback();
      this.deploymentConfiguration.applyBranding(result.branding);
      this.deploymentConfiguration.applySocialLinks(result.socialLinks);
      this.deploymentConfiguration.applyPrivacyContact(result.privacyContact);
      this.noticeRef.set(noticeKey);
    }
    return result;
  }

  async testConfiguration(
    kind: OperatorConfigurationTestKind
  ): Promise<OperatorConfigurationTestResultDto | null> {
    const lifecycleGeneration = this.configurationLifecycleGeneration;
    const requestGeneration = this.requestGeneration;
    this.clearConfigurationTestFeedback(kind);
    if (kind === 'FIREBASE_AUTHENTICATION') {
      this.configurationAuthenticationTestRef.set(null);
    } else {
      this.configurationMessagingTestRef.set(null);
    }
    const destinationToken =
      this.configurationMessagingDestinationTokenRef().trim();
    let readinessLease: FirebaseMessagingReadinessLease | null = null;
    if (kind === 'FIREBASE_MESSAGING') {
      const publicConfiguration =
        this.configurationRef()?.firebase.publicConfiguration;
      if (publicConfiguration?.vapidKey?.trim()) {
        try {
          readinessLease =
            await this.firebaseMessagingService.createBrowserReadinessLease({
              revision: publicConfiguration.revision,
              apiKey: publicConfiguration.apiKey,
              authDomain: publicConfiguration.authDomain,
              projectId: publicConfiguration.projectId,
              storageBucket: publicConfiguration.storageBucket,
              messagingSenderId: publicConfiguration.messagingSenderId,
              appId: publicConfiguration.appId,
              ...(publicConfiguration.measurementId
                ? { measurementId: publicConfiguration.measurementId }
                : {}),
              vapidKey: publicConfiguration.vapidKey
            });
        } catch {
          // The backend receives no proof and clears stale readiness state.
        }
      }
    }
    if (
      lifecycleGeneration !== this.configurationLifecycleGeneration
      || requestGeneration !== this.requestGeneration
    ) {
      await readinessLease?.release();
      return null;
    }
    const testRequestGeneration = this.requestGeneration + 1;
    const result = await this.run(
      kind === 'FIREBASE_AUTHENTICATION' ? 'test-authentication' : 'test-messaging',
      async () => {
        try {
          return await this.service.testConfiguration({
            kind,
            ...(kind === 'FIREBASE_MESSAGING' && destinationToken
              ? { destinationToken }
              : {}),
            ...(kind === 'FIREBASE_MESSAGING' && readinessLease
              ? {
                  browserReadinessToken: readinessLease.proof.token,
                  browserConfigurationRevision:
                    readinessLease.proof.configurationRevision,
                  browserAppId: readinessLease.proof.appId
                }
              : {})
          });
        } finally {
          try {
            await readinessLease?.release();
          } finally {
            /*
             * A failed capability test can deactivate the live revision.
             * Keep the browser runtime fail-closed even when this popup was
             * closed while the backend request was in flight.
             */
            await this.firebaseAppService.refreshFirebaseApp();
          }
        }
      }
    );
    if (
      lifecycleGeneration !== this.configurationLifecycleGeneration
      || testRequestGeneration !== this.requestGeneration
    ) {
      return null;
    }
    if (result) {
      const authoritativeFirebase = result.firebase;
      if (authoritativeFirebase) {
        this.configurationRef.update(current => current
          ? {
              ...current,
              firebase: structuredClone(authoritativeFirebase)
            }
          : current
        );
      }
      if (kind === 'FIREBASE_AUTHENTICATION') {
        this.configurationAuthenticationTestRef.set(result);
      } else {
        this.configurationMessagingTestRef.set(result);
      }
      this.showConfigurationTestFeedback(
        kind,
        result.success ? 'success' : 'error'
      );
    } else if (this.errorRef()) {
      const failure: OperatorConfigurationTestResultDto = {
        kind,
        success: false,
        message: this.errorRef(),
        testedAt: new Date().toISOString(),
        firebase: null
      };
      if (kind === 'FIREBASE_AUTHENTICATION') {
        this.configurationAuthenticationTestRef.set(failure);
      } else {
        this.configurationMessagingTestRef.set(failure);
      }
      this.showConfigurationTestFeedback(kind, 'error');
    }
    return result;
  }

  async activateFirebase(): Promise<OperatorConfigurationDto | null> {
    const result = await this.run(
      'activate-firebase',
      async () => {
        try {
          return await this.service.activateFirebase();
        } finally {
          /*
           * Activation changes the public Firebase revision boundary. This
           * reconciliation must not depend on the popup still being open.
           */
          await this.firebaseAppService.refreshFirebaseApp();
        }
      }
    );
    if (result) {
      this.configurationRef.set(result);
      this.configurationDraftRef.set(this.configurationDraftFrom(result));
      this.noticeRef.set('operator.configuration.firebase.activated');
    }
    return result;
  }

  clearFeedback(): void {
    this.errorRef.set('');
    this.noticeRef.set('');
    this.feedbackActionRef.set(null);
    this.configurationAuthenticationTestRef.set(null);
    this.configurationMessagingTestRef.set(null);
    this.configurationMessagingDestinationTokenRef.set('');
    this.clearConfigurationTestFeedback();
      this.clearTlsTestFeedback();
    this.clearTlsSaveFeedback();
  }

  clearConfigurationCredentialDrafts(): void {
    this.configurationLifecycleGeneration += 1;
    const busyAction = this.busyActionRef();
    if (
      busyAction
      && CONFIGURATION_BUSY_ACTIONS.has(busyAction)
    ) {
      /*
       * Closing or replacing the configuration popup invalidates in-flight
       * responses. The HTTP request may still complete server-side, but stale
       * test/save state must never be written back into a later popup session.
       */
      this.requestGeneration += 1;
      this.busyActionRef.set(null);
      this.feedbackActionRef.set(null);
    }
    this.configurationDraftRef.update(current => current
      ? {
          ...current,
          firebase: {
            ...current.firebase,
            authenticationCredential: '',
            messagingCredential: ''
          }
        }
      : current
    );
    this.tlsConfigurationDraftRef.update(current => current
      ? {
          ...current,
          certificate: '',
          privateKey: ''
        }
      : current
    );
    this.configurationAuthenticationTestRef.set(null);
    this.configurationMessagingTestRef.set(null);
    this.configurationMessagingDestinationTokenRef.set('');
    this.clearConfigurationTestFeedback();
  }

  setConfigurationBranding(
    patch: Partial<OperatorConfigurationSaveRequestDto['branding']>
  ): void {
    this.configurationDraftRef.update(current => current
      ? {
          ...current,
          branding: {
            ...current.branding,
            ...patch
          }
        }
      : current
    );
  }

  setConfigurationAdminEmailsInput(value: string): void {
    const input = `${value ?? ''}`.slice(0, 8192);
    this.configurationAdminEmailsInputRef.set(input);
    this.configurationDraftRef.update(current => current
      ? {
          ...current,
          adminEmails: OperatorConfigurationMapper.adminEmails(input)
        }
      : current
    );
  }

  setConfigurationPrivacyContact(
    patch: Partial<OperatorConfigurationSaveRequestDto['privacyContact']>
  ): void {
    this.configurationDraftRef.update(current => current
      ? {
          ...current,
          privacyContact: {
            ...current.privacyContact,
            ...patch
          }
        }
      : current
    );
  }

  addConfigurationSocialLink(): void {
    this.configurationDraftRef.update(current => {
      if (
        !current
        || current.socialLinks.length
          >= OperatorConfigurationMapper.SOCIAL_LINK_MAX_COUNT
      ) {
        return current;
      }
      return {
        ...current,
        socialLinks: [
          ...current.socialLinks,
          {
            provider: '',
            label: '',
            url: '',
            icon: null,
            handle: null
          }
        ]
      };
    });
  }

  setConfigurationSocialLink(
    index: number,
    patch: Partial<OperatorConfigurationSaveRequestDto['socialLinks'][number]>
  ): void {
    this.configurationDraftRef.update(current => {
      if (!current || index < 0 || index >= current.socialLinks.length) {
        return current;
      }
      return {
        ...current,
        socialLinks: current.socialLinks.map((link, linkIndex) =>
          linkIndex === index
            ? {
                ...link,
                ...patch
              }
            : link
        )
      };
    });
  }

  removeConfigurationSocialLink(index: number): void {
    this.configurationDraftRef.update(current => {
      if (!current || index < 0 || index >= current.socialLinks.length) {
        return current;
      }
      return {
        ...current,
        socialLinks: current.socialLinks.filter(
          (_link, linkIndex) => linkIndex !== index
        )
      };
    });
  }

  setConfigurationIntegration(
    patch: Partial<NonNullable<OperatorConfigurationSaveRequestDto['integration']>>
  ): void {
    this.configurationDraftRef.update(current => current
      ? {
          ...current,
          integration: {
            publicBaseUrl: current.integration?.publicBaseUrl ?? '',
            ...patch
          }
        }
      : current
    );
  }

  setConfigurationFirebase(
    patch: Partial<OperatorConfigurationSaveRequestDto['firebase']>
  ): void {
    this.configurationDraftRef.update(current => current
      ? {
          ...current,
          firebase: {
            ...current.firebase,
            ...patch
          }
        }
      : current
    );
  }

  setConfigurationMessagingDestinationToken(value: string): void {
    this.configurationMessagingDestinationTokenRef.set(
      `${value ?? ''}`.slice(0, 4096)
    );
    this.configurationMessagingTestRef.set(null);
    this.clearConfigurationTestFeedback('FIREBASE_MESSAGING');
  }

  private async run<T>(
    action: Exclude<OperatorWorkspaceBusyAction, null>,
    request: () => Promise<T>
  ): Promise<T | null> {
    const generation = ++this.requestGeneration;
    this.busyActionRef.set(action);
    this.feedbackActionRef.set(action);
    this.errorRef.set('');
    this.noticeRef.set('');
    try {
      const result = await request();
      return generation === this.requestGeneration ? result : null;
    } catch (error) {
      if (generation === this.requestGeneration) {
        this.errorRef.set(this.messageFromError(error));
      }
      return null;
    } finally {
      if (generation === this.requestGeneration) {
        this.busyActionRef.set(null);
      }
    }
  }

  private reset(): void {
    this.deploymentUpdateRef.set(null);
    this.deploymentUpdateGeneration+=1;
    this.deploymentUpdateRequest=null;
    this.requestGeneration += 1;
    this.configurationRef.set(null);
    this.configurationDraftRef.set(null);
    this.configurationAdminEmailsInputRef.set('');
    this.configurationAuthenticationTestRef.set(null);
    this.configurationMessagingTestRef.set(null);
    this.configurationMessagingDestinationTokenRef.set('');
    this.busyActionRef.set(null);
    this.clearFeedback();
      this.tlsConfigurationRef.set(null);
    this.tlsConfigurationDraftRef.set(null);
    this.tlsJobRef.set(null);
  }

  private sessionKey(session: AppSession | null): string {
    if (session?.kind === 'demo') {
      return `demo:${session.userId.trim()}`;
    }
    if (session?.kind === 'firebase') {
      return `firebase:${session.profile.id.trim()}`;
    }
    if (session?.kind === 'operator-bootstrap') {
      return `operator-bootstrap:${session.email.trim()}`;
    }
    return 'none';
  }

  private configurationDraftFrom(
    configuration: OperatorConfigurationDto
  ): OperatorConfigurationSaveRequestDto {
    return {
      adminEmails: OperatorConfigurationMapper.adminEmails(
        configuration.adminEmails
      ),
      privacyContact: {
        dataControllerName:
          configuration.privacyContact.dataControllerName,
        privacyContactEmail:
          configuration.privacyContact.privacyContactEmail
      },
      socialLinks: OperatorConfigurationMapper.socialLinks(
        configuration.socialLinks
      ),
      branding: {
        productName: configuration.branding.productName,
        logoUrl: configuration.branding.logoUrl,
        logoCharacterIndex: configuration.branding.logoCharacterIndex,

      },
      integration: {
        publicBaseUrl: configuration.integration?.publicBaseUrl ?? ''
      },
      firebase: {
        projectId: configuration.firebase.projectId,
        apiKey: configuration.firebase.publicConfiguration.apiKey,
        authDomain: configuration.firebase.publicConfiguration.authDomain,
        storageBucket:
          configuration.firebase.publicConfiguration.storageBucket,
        messagingSenderId:
          configuration.firebase.publicConfiguration.messagingSenderId,
        appId: configuration.firebase.publicConfiguration.appId,
        measurementId:
          configuration.firebase.publicConfiguration.measurementId ?? '',
        vapidKey: configuration.firebase.publicConfiguration.vapidKey ?? '',
        authenticationCredential: '',
        messagingCredential: ''
      }
    };
  }

  private messageFromError(error: unknown): string {
    if (error && typeof error === 'object') {
      const source = error as {
        error?: { message?: unknown; detail?: unknown };
        message?: unknown;
        name?: unknown;
      };
      const serverMessage = typeof source.error?.message === 'string'
        ? source.error.message.trim()
        : typeof source.error?.detail === 'string'
          ? source.error.detail.trim()
          : '';
      if (serverMessage) {
        return serverMessage;
      }
      if (source.name === 'TimeoutError') {
        return 'operator.request.timeout';
      }
      if (typeof source.message === 'string' && source.message.trim()) {
        return source.message.trim();
      }
    }
    return 'operator.request.failed';
  }

  private showConfigurationTestFeedback(
    kind: OperatorConfigurationTestKind,
    state: Exclude<OperatorConfigurationTestFeedback, null>
  ): void {
    const feedbackRef = kind === 'FIREBASE_AUTHENTICATION'
      ? this.configurationAuthenticationFeedbackRef
      : this.configurationMessagingFeedbackRef;
    feedbackRef.set(state);
    const timer = setTimeout(() => {
      feedbackRef.set(null);
      if (kind === 'FIREBASE_AUTHENTICATION') {
        this.configurationAuthenticationFeedbackTimer = null;
      } else {
        this.configurationMessagingFeedbackTimer = null;
      }
    }, 1000);
    if (kind === 'FIREBASE_AUTHENTICATION') {
      this.configurationAuthenticationFeedbackTimer = timer;
    } else {
      this.configurationMessagingFeedbackTimer = timer;
    }
  }

  private clearConfigurationTestFeedback(
    kind?: OperatorConfigurationTestKind
  ): void {
    if (!kind || kind === 'FIREBASE_AUTHENTICATION') {
      if (this.configurationAuthenticationFeedbackTimer) {
        clearTimeout(this.configurationAuthenticationFeedbackTimer);
        this.configurationAuthenticationFeedbackTimer = null;
      }
      this.configurationAuthenticationFeedbackRef.set(null);
    }
    if (!kind || kind === 'FIREBASE_MESSAGING') {
      if (this.configurationMessagingFeedbackTimer) {
        clearTimeout(this.configurationMessagingFeedbackTimer);
        this.configurationMessagingFeedbackTimer = null;
      }
      this.configurationMessagingFeedbackRef.set(null);
    }
  }

  private readonly tlsConfigurationRef =
    signal<OperatorTlsConfigurationDto | null>(null);

  private readonly tlsConfigurationDraftRef =
    signal<OperatorTlsConfigurationUpdateDto | null>(null);

  private readonly tlsJobRef = signal<OperatorTlsJobDto | null>(null);

  private readonly tlsDomainFeedbackRef =
    signal<OperatorConfigurationTestFeedback>(null);

  private readonly tlsCertificateFeedbackRef =
    signal<OperatorConfigurationTestFeedback>(null);

  private readonly tlsSaveFeedbackRef =
    signal<OperatorConfigurationTestFeedback>(null);

  private tlsDomainFeedbackTimer:
    ReturnType<typeof setTimeout> | null = null;

  private tlsCertificateFeedbackTimer:
    ReturnType<typeof setTimeout> | null = null;

  private tlsSaveFeedbackTimer:
    ReturnType<typeof setTimeout> | null = null;

  readonly tlsConfiguration = this.tlsConfigurationRef.asReadonly();

  readonly tlsConfigurationDraft = this.tlsConfigurationDraftRef.asReadonly();

  readonly tlsJob = this.tlsJobRef.asReadonly();

  readonly tlsDomainFeedback = this.tlsDomainFeedbackRef.asReadonly();

  readonly tlsCertificateFeedback =
    this.tlsCertificateFeedbackRef.asReadonly();

  readonly tlsSaveFeedback = this.tlsSaveFeedbackRef.asReadonly();

  readonly tlsConfigurationReady = computed(() => {
    const draft = this.tlsConfigurationDraftRef();
    if (!draft || !draft.enabled) {
      return Boolean(draft);
    }
    if (!/^(?=.{1,253}$)(?![.-])(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/i
      .test(draft.domain.trim())) {
      return false;
    }
    if (
      draft.mode === 'AUTOMATIC'
      && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contactEmail.trim())
    ) {
      return false;
    }
    const installed = this.tlsConfigurationRef();
    const reusableManualCertificate = installed?.certificateConfigured === true
      && installed.mode === 'MANUAL'
      && installed.domain.trim().toLowerCase()
        === draft.domain.trim().toLowerCase();
    return draft.mode !== 'MANUAL'
      || Boolean(
        (draft.certificate.trim() && draft.privateKey.trim())
        || reusableManualCertificate
      );
  });

  setTlsConfiguration(
    patch: Partial<OperatorTlsConfigurationUpdateDto>
  ): void {
    this.clearTlsTestFeedback();
    this.tlsConfigurationDraftRef.update(current => current
      ? {
          ...current,
          ...patch,
          ...(patch.mode === 'MANUAL' ? { autoRenew: false } : {})
        }
      : current
    );
  }

  async testTlsConfiguration(
    kind: OperatorTlsTestKind
  ): Promise<OperatorTlsJobDto | null> {
    this.clearTlsTestFeedback(kind);
    const draft = this.tlsConfigurationDraftRef();
    if (!draft || !this.tlsConfigurationReady()) {
      this.errorRef.set('operator.configuration.tls.validation.invalid');
      return null;
    }
    const action = kind === 'DOMAIN'
      ? 'test-tls-domain'
      : 'test-tls-certificate';
    const result = await this.run(
      action,
      () => this.service.testTlsConfiguration({
        kind,
        configuration: structuredClone(draft)
      })
    );
    if (result) {
      this.tlsJobRef.set(result);
      this.noticeRef.set(result.message);
      this.showTlsTestFeedback(kind, 'success');
    } else if (this.errorRef()) {
      this.showTlsTestFeedback(kind, 'error');
    }
    return result;
  }

  async saveTlsConfiguration(): Promise<OperatorTlsJobDto | null> {
    this.clearTlsSaveFeedback();
    const draft = this.tlsConfigurationDraftRef();
    if (!draft || !this.tlsConfigurationReady()) {
      this.errorRef.set('operator.configuration.tls.validation.invalid');
      this.showTlsSaveFeedback('error');
      return null;
    }
    const result = await this.run(
      'save-tls',
      () => this.service.saveTlsConfiguration(structuredClone(draft))
    );
    if (result) {
      this.tlsJobRef.set(result);
      const configuration = result.configuration
        ?? (result.phase === 'COMPLETED'
          ? await this.service.loadTlsConfiguration().catch(() => null)
          : null);
      if (configuration) {
        this.tlsConfigurationRef.set(configuration);
        this.tlsConfigurationDraftRef.set(this.tlsDraftFrom(configuration));
        this.noticeRef.set('operator.configuration.tls.saved');
      } else {
        this.tlsConfigurationDraftRef.update(current => current
          ? { ...current, certificate: '', privateKey: '' }
          : current
        );
        this.noticeRef.set(result.message);
      }
      this.showTlsSaveFeedback('success');
    } else if (this.errorRef()) {
      this.showTlsSaveFeedback('error');
    }
    return result;
  }

  private tlsDraftFrom(
    configuration: OperatorTlsConfigurationDto
  ): OperatorTlsConfigurationUpdateDto {
    return {
      enabled: configuration.enabled,
      mode: configuration.mode,
      domain: configuration.domain,
      contactEmail: configuration.contactEmail,
      autoRenew: configuration.mode === 'AUTOMATIC'
        && configuration.autoRenew,
      certificate: '',
      privateKey: ''
    };
  }

  private showTlsTestFeedback(
    kind: OperatorTlsTestKind,
    state: Exclude<OperatorConfigurationTestFeedback, null>
  ): void {
    const feedbackRef = kind === 'DOMAIN'
      ? this.tlsDomainFeedbackRef
      : this.tlsCertificateFeedbackRef;
    feedbackRef.set(state);
    const timer = setTimeout(() => {
      feedbackRef.set(null);
      if (kind === 'DOMAIN') {
        this.tlsDomainFeedbackTimer = null;
      } else {
        this.tlsCertificateFeedbackTimer = null;
      }
    }, 1000);
    if (kind === 'DOMAIN') {
      this.tlsDomainFeedbackTimer = timer;
    } else {
      this.tlsCertificateFeedbackTimer = timer;
    }
  }

  private clearTlsTestFeedback(kind?: OperatorTlsTestKind): void {
    if (!kind || kind === 'DOMAIN') {
      if (this.tlsDomainFeedbackTimer) {
        clearTimeout(this.tlsDomainFeedbackTimer);
        this.tlsDomainFeedbackTimer = null;
      }
      this.tlsDomainFeedbackRef.set(null);
    }
    if (!kind || kind === 'CERTIFICATE') {
      if (this.tlsCertificateFeedbackTimer) {
        clearTimeout(this.tlsCertificateFeedbackTimer);
        this.tlsCertificateFeedbackTimer = null;
      }
      this.tlsCertificateFeedbackRef.set(null);
    }
  }

  private showTlsSaveFeedback(
    state: Exclude<OperatorConfigurationTestFeedback, null>
  ): void {
    this.tlsSaveFeedbackRef.set(state);
    this.tlsSaveFeedbackTimer = setTimeout(() => {
      this.tlsSaveFeedbackRef.set(null);
      this.tlsSaveFeedbackTimer = null;
    }, 1000);
  }

  private clearTlsSaveFeedback(): void {
    if (this.tlsSaveFeedbackTimer) {
      clearTimeout(this.tlsSaveFeedbackTimer);
      this.tlsSaveFeedbackTimer = null;
    }
    this.tlsSaveFeedbackRef.set(null);
  }

private readonly deploymentUpdateRef = signal<OperatorDeploymentUpdateDto | null>(null);

private deploymentUpdateGeneration = 0;

private deploymentUpdateRequest: Promise<OperatorDeploymentUpdateDto | null> | null = null;

readonly deploymentUpdate = this.deploymentUpdateRef.asReadonly();

async loadDeploymentUpdate(
    force = false
  ): Promise<OperatorDeploymentUpdateDto | null> {
    const cached = this.deploymentUpdateRef();
    if (cached && !force) {
      return cached;
    }
    const result = await this.run(
      'load-update',
      () => this.requestDeploymentUpdate()
    );
    if (result) {
      this.deploymentUpdateRef.set(result);
    }
    return result;
  }

async preloadDeploymentUpdate(): Promise<OperatorDeploymentUpdateDto | null> {
    if (this.deploymentUpdateRef()) return this.deploymentUpdateRef();
    // Native avatar hydration starts this independently of popup loading.
    // An unsuccessful background check is retried by the normal Updates action.
    return this.requestDeploymentUpdate().catch(() => null);
  }

private requestDeploymentUpdate(): Promise<OperatorDeploymentUpdateDto | null> {
    if (this.deploymentUpdateRequest) return this.deploymentUpdateRequest;
    const generation = this.deploymentUpdateGeneration;
    const contextKey = this.sessionKey(this.sessionService.currentSession());
    const request = this.updateService.loadDeploymentUpdate().then(result => {
      if (generation !== this.deploymentUpdateGeneration
        || contextKey !== this.sessionKey(this.sessionService.currentSession())) return null;
      this.deploymentUpdateRef.set(result);
      return result;
    }).finally(() => {
      if (this.deploymentUpdateRequest === request) this.deploymentUpdateRequest = null;
    });
    this.deploymentUpdateRequest = request;
    return request;
  }

async refreshDeploymentUpdate(): Promise<OperatorDeploymentUpdateDto | null> {
    return this.loadDeploymentUpdate(true);
  }

async applyDeploymentUpdate(): Promise<OperatorDeploymentUpdateDto | null> {
    return this.executeDeploymentUpdate(false);
  }

async rollbackDeploymentUpdate(): Promise<OperatorDeploymentUpdateDto | null> {
    return this.executeDeploymentUpdate(true);
  }

private async executeDeploymentUpdate(rollback: boolean): Promise<OperatorDeploymentUpdateDto | null> {
    const operation = rollback ? this.updateService.rollbackDeploymentUpdate.bind(this.updateService)
      : this.updateService.applyDeploymentUpdate.bind(this.updateService);
    return this.run(
      rollback ? 'rollback-update' : 'apply-update',
      async () => {
        const result = await operation(progress => {
          this.deploymentUpdateRef.update(current =>
            current
              ? {
                  ...current,
                  progress,
                  availableVersion: rollback && current.rollback
                    ? current.rollback.targetVersion : current.availableVersion
                }
              : current
          );
        });
        this.deploymentUpdateRef.set(result);
        if (result.progress?.phase === 'COMPLETED' && result.progress.percent === 100) {
          await this.pwaService.reloadAfterDeploymentChange();
        }
        return result;
      }
    );
  }

private readonly pwaService = inject(PwaService);
}
