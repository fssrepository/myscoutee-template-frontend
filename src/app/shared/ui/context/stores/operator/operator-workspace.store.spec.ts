import {OperatorUpdateService} from '../../../../core/base/services/operator/operator-update.service';
import {PwaService} from '../../../../core/base/services/platform/pwa.service';
import type {OperatorDeploymentUpdateDto} from '../../../../core/contracts/operator/operator-update.interface';
import '@angular/compiler';
import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {describe,it,expect,vi,beforeEach,afterEach} from 'vitest';
import {OperatorConfigurationService} from '../../../../core/base/services/operator/operator-configuration.service';
import {DeploymentConfigurationService} from '../../../../core/base/services/platform/deployment-configuration.service';
import {FirebaseAppService} from '../../../../core/base/services/accounts/firebase-app.service';
import {FirebaseMessagingService} from '../../../../core/base/services/notifications/firebase-messaging.service';
import {SessionService} from '../../../../core/base/services/accounts/session.service';
import type {OperatorConfigurationDto,OperatorConfigurationTestResultDto} from '../../../../core/contracts/operator/operator.interface';
import {OperatorWorkspaceStore} from './operator-workspace.store';
import {UserProfileStore} from '../profile/user-profile.store';
describe('Selected operator configuration workspace',()=>{
 const loadDeploymentUpdate=vi.fn(),applyDeploymentUpdate=vi.fn(),rollbackDeploymentUpdate=vi.fn(),reloadAfterDeploymentChange=vi.fn();
 const loadConfiguration=vi.fn();
 const loadTlsConfiguration=vi.fn(),saveTlsConfiguration=vi.fn(),testTlsConfiguration=vi.fn();
 const saveConfiguration=vi.fn();
 const testConfiguration=vi.fn();
 const refreshFirebaseApp=vi.fn();
 const applyPrivacyContact=vi.fn();
 const createBrowserReadinessLease=vi.fn();
 const releaseBrowserReadinessLease=vi.fn();
 beforeEach(()=>{
  loadDeploymentUpdate.mockReset();applyDeploymentUpdate.mockReset();rollbackDeploymentUpdate.mockReset();reloadAfterDeploymentChange.mockReset().mockResolvedValue(undefined);
  loadConfiguration.mockReset();
  loadTlsConfiguration.mockReset().mockResolvedValue({capability:'AVAILABLE',unavailableReason:null,enabled:false,mode:'AUTOMATIC',domain:'',contactEmail:'',autoRenew:true,certificateConfigured:false,certificateIssuer:null,certificateExpiresAt:null,updatedAt:null});
  saveTlsConfiguration.mockReset();testTlsConfiguration.mockReset();
  saveConfiguration.mockReset();
  testConfiguration.mockReset();
  refreshFirebaseApp.mockReset();
  applyPrivacyContact.mockReset();
  createBrowserReadinessLease.mockReset();
  releaseBrowserReadinessLease.mockReset();
  refreshFirebaseApp.mockResolvedValue(null);releaseBrowserReadinessLease.mockResolvedValue(undefined);
  const session=signal({kind:'demo',userId:'operator-fixture'});
  TestBed.configureTestingModule({providers:[OperatorWorkspaceStore,
   {provide:OperatorUpdateService,useValue:{loadDeploymentUpdate,applyDeploymentUpdate,rollbackDeploymentUpdate}},
   {provide:PwaService,useValue:{reloadAfterDeploymentChange}},
   {provide:OperatorConfigurationService,useValue:{loadConfiguration,saveConfiguration,testConfiguration,loadTlsConfiguration,saveTlsConfiguration,testTlsConfiguration}},
   {provide:DeploymentConfigurationService,useValue:{applyBranding:vi.fn(),applySocialLinks:vi.fn(),applyPrivacyContact}},
   {provide:FirebaseAppService,useValue:{refreshFirebaseApp}},
   {provide:FirebaseMessagingService,useValue:{createBrowserReadinessLease}},
   {provide:SessionService,useValue:{session,currentSession:()=>session()}},
   {provide:UserProfileStore,useValue:{activeUserProfile:signal({id:'operator-fixture'})}}
  ]});
 });
 afterEach(()=>{TestBed.resetTestingModule();vi.useRealTimers();});
 it('briefly exposes independent shared action feedback for Firebase tests', async () => {
    vi.useFakeTimers();
    testConfiguration.mockResolvedValue({
      kind: 'FIREBASE_AUTHENTICATION',
      success: true,
      message: 'operator.configuration.test.success',
      testedAt: '2026-07-28T18:00:00.000Z',
      firebase: null
    });
    const store = TestBed.inject(OperatorWorkspaceStore);

    await store.testConfiguration('FIREBASE_AUTHENTICATION');

    expect(store.configurationAuthenticationFeedback()).toBe('success');
    expect(store.configurationMessagingFeedback()).toBeNull();
    expect(store.configurationAuthenticationTest()?.success).toBe(true);

    await vi.advanceTimersByTimeAsync(1000);

    expect(store.configurationAuthenticationFeedback()).toBeNull();
  });
it('drops an in-flight Firebase result after the configuration popup ends', async () => {
    let resolveTest!: (
      value: OperatorConfigurationTestResultDto
    ) => void;
    testConfiguration.mockImplementation(() =>
      new Promise<OperatorConfigurationTestResultDto>(resolve => {
        resolveTest = resolve;
      })
    );
    const store = TestBed.inject(OperatorWorkspaceStore);

    const pending = store.testConfiguration(
      'FIREBASE_AUTHENTICATION'
    );
    expect(store.busyAction()).toBe('test-authentication');

    store.clearConfigurationCredentialDrafts();
    resolveTest({
      kind: 'FIREBASE_AUTHENTICATION',
      success: true,
      message: 'operator.configuration.test.success',
      testedAt: '2026-07-28T18:00:00.000Z',
      firebase: null
    });

    await expect(pending).resolves.toBeNull();
    expect(store.busyAction()).toBeNull();
    expect(store.configurationAuthenticationTest()).toBeNull();
    expect(store.configurationAuthenticationFeedback()).toBeNull();
    expect(refreshFirebaseApp).toHaveBeenCalledOnce();
  });
it('releases browser readiness without testing after the popup ends', async () => {
    const configured = operatorConfiguration();
    configured.firebase = {
      ...configured.firebase,
      projectId: 'community-project',
      messagingCredentialConfigured: true,
      publicConfiguration: {
        revision: 9,
        apiKey: 'browser-api-key',
        authDomain: 'community-project.firebaseapp.com',
        projectId: 'community-project',
        storageBucket: '',
        messagingSenderId: '123456789',
        appId: '1:123456789:web:operator',
        measurementId: null,
        vapidKey: 'public-vapid-key'
      }
    };
    loadConfiguration.mockResolvedValue(configured);
    let resolveLease!: (
      value: {
        proof: {
          token: string;
          configurationRevision: number;
          appId: string;
        };
        release: () => Promise<void>;
      }
    ) => void;
    createBrowserReadinessLease.mockImplementation(() =>
      new Promise(resolve => {
        resolveLease = resolve;
      })
    );
    const store = TestBed.inject(OperatorWorkspaceStore);
    await store.loadConfiguration();

    const pending = store.testConfiguration('FIREBASE_MESSAGING');
    store.clearConfigurationCredentialDrafts();
    resolveLease({
      proof: {
        token: 'browser-generated-token',
        configurationRevision: 9,
        appId: '1:123456789:web:operator'
      },
      release: releaseBrowserReadinessLease
    });

    await expect(pending).resolves.toBeNull();
    expect(releaseBrowserReadinessLease).toHaveBeenCalledOnce();
    expect(testConfiguration).not.toHaveBeenCalled();
  });
it('sends current browser readiness proof and releases its isolated token', async () => {
    const configured = operatorConfiguration();
    configured.firebase = {
      ...configured.firebase,
      projectId: 'community-project',
      messagingCredentialConfigured: true,
      publicConfiguration: {
        revision: 7,
        apiKey: 'browser-api-key',
        authDomain: 'community-project.firebaseapp.com',
        projectId: 'community-project',
        storageBucket: 'community-project.firebasestorage.app',
        messagingSenderId: '123456789',
        appId: '1:123456789:web:operator',
        measurementId: null,
        vapidKey: 'public-vapid-key'
      }
    };
    loadConfiguration.mockResolvedValue(configured);
    createBrowserReadinessLease.mockResolvedValue({
      proof: {
        token: 'browser-generated-token',
        configurationRevision: 7,
        appId: '1:123456789:web:operator'
      },
      release: releaseBrowserReadinessLease
    });
    testConfiguration.mockResolvedValue({
      kind: 'FIREBASE_MESSAGING',
      success: true,
      message: 'Firebase messaging test succeeded.',
      testedAt: '2026-07-28T18:05:00.000Z',
      firebase: null
    });
    const store = TestBed.inject(OperatorWorkspaceStore);
    await store.loadConfiguration();

    store.setConfigurationMessagingDestinationToken(' registration-token ');
    await store.testConfiguration('FIREBASE_MESSAGING');

    expect(testConfiguration).toHaveBeenCalledWith({
      kind: 'FIREBASE_MESSAGING',
      destinationToken: 'registration-token',
      browserReadinessToken: 'browser-generated-token',
      browserConfigurationRevision: 7,
      browserAppId: '1:123456789:web:operator'
    });
    expect(releaseBrowserReadinessLease).toHaveBeenCalledOnce();
    expect(store.configurationMessagingTest()?.success).toBe(true);

    store.clearFeedback();

    expect(store.configurationMessagingDestinationToken()).toBe('');
  });
it('fails closed through the backend when browser readiness cannot be created', async () => {
    const configured = operatorConfiguration();
    configured.firebase = {
      ...configured.firebase,
      projectId: 'community-project',
      messagingCredentialConfigured: true,
      publicConfiguration: {
        ...configured.firebase.publicConfiguration,
        revision: 8,
        projectId: 'community-project',
        appId: '1:123456789:web:operator',
        vapidKey: 'public-vapid-key'
      }
    };
    loadConfiguration.mockResolvedValue(configured);
    createBrowserReadinessLease.mockRejectedValue(
      new Error('operator.configuration.test.failed')
    );
    testConfiguration.mockResolvedValue({
      kind: 'FIREBASE_MESSAGING',
      success: false,
      message: 'operator.configuration.test.failed',
      testedAt: '2026-07-28T18:05:00.000Z',
      firebase: {
        ...configured.firebase,
        messagingTestedAt: null
      }
    });
    const store = TestBed.inject(OperatorWorkspaceStore);
    await store.loadConfiguration();

    await store.testConfiguration('FIREBASE_MESSAGING');

    expect(testConfiguration).toHaveBeenCalledWith({
      kind: 'FIREBASE_MESSAGING'
    });
    expect(store.configurationMessagingTest()?.success).toBe(false);
  });
it('applies authoritative Firebase deactivation from a failed backend test', async () => {
    const active = operatorConfiguration();
    active.firebase = {
      ...active.firebase,
      active: true,
      activatedAt: '2026-07-28T17:00:00.000Z'
    };
    loadConfiguration.mockResolvedValue(active);
    testConfiguration.mockResolvedValue({
      kind: 'FIREBASE_AUTHENTICATION',
      success: false,
      message: 'Firebase authentication test failed.',
      testedAt: '2026-07-28T18:10:00.000Z',
      firebase: {
        ...active.firebase,
        active: false,
        readyToActivate: false,
        authenticationTestedAt: null,
        activatedAt: null
      }
    });
    const store = TestBed.inject(OperatorWorkspaceStore);
    await store.loadConfiguration();
    store.setConfigurationFirebase({
      apiKey: 'unsaved-browser-api-key'
    });

    await store.testConfiguration('FIREBASE_AUTHENTICATION');

    expect(store.configuration()?.firebase.active).toBe(false);
    expect(store.configuration()?.firebase.activatedAt).toBeNull();
    expect(store.configurationDraft()?.firebase.apiKey)
      .toBe('unsaved-browser-api-key');
    expect(refreshFirebaseApp).toHaveBeenCalledOnce();
  });
it('normalizes and saves root administrator and social-link configuration', async () => {
    const initial = operatorConfiguration();
    loadConfiguration.mockResolvedValue(initial);
    saveConfiguration.mockImplementation(async request => ({
      ...initial,
      adminEmails: request.adminEmails,
      privacyContact: {
        configured: Boolean(
          request.privacyContact.dataControllerName
          && request.privacyContact.privacyContactEmail
        ),
        dataControllerName:
          request.privacyContact.dataControllerName.trim(),
        privacyContactEmail:
          request.privacyContact.privacyContactEmail.trim().toLowerCase()
      },
      socialLinks: request.socialLinks,
      updatedAt: '2026-07-28T19:00:00.000Z'
    }));
    const store = TestBed.inject(OperatorWorkspaceStore);

    await store.loadConfiguration();
    store.setConfigurationAdminEmailsInput(
      ' Owner@Example.test, owner@example.test\nadmin@example.test '
    );
    store.setConfigurationPrivacyContact({
      dataControllerName: '  Example Operator s.r.o.  ',
      privacyContactEmail: ' Privacy@Example.test '
    });
    store.addConfigurationSocialLink();
    store.setConfigurationSocialLink(0, {
      provider: 'community',
      label: 'Community',
      url: 'https://community.example.test',
      icon: 'forum',
      handle: '@community'
    });

    await store.saveConfiguration('save-social-links');

    expect(saveConfiguration).toHaveBeenCalledWith(
      expect.objectContaining({
        adminEmails: ['owner@example.test', 'admin@example.test'],
        privacyContact: {
          dataControllerName: '  Example Operator s.r.o.  ',
          privacyContactEmail: ' Privacy@Example.test '
        },
        socialLinks: [{
          provider: 'community',
          label: 'Community',
          url: 'https://community.example.test/',
          icon: 'forum',
          handle: '@community'
        }]
      })
    );
    expect(store.configuration()?.adminEmails).toEqual([
      'owner@example.test',
      'admin@example.test'
    ]);
    expect(store.configuration()?.privacyContact).toEqual({
      configured: true,
      dataControllerName: 'Example Operator s.r.o.',
      privacyContactEmail: 'privacy@example.test'
    });
    expect(store.configurationPrivacyContactReady()).toBe(true);
    expect(applyPrivacyContact).toHaveBeenLastCalledWith(
      store.configuration()?.privacyContact
    );
    expect(store.configuration()?.socialLinks[0]?.provider).toBe('community');
  });
it('rejects a partial privacy contact before saving', async () => {
    loadConfiguration.mockResolvedValue(operatorConfiguration());
    const store = TestBed.inject(OperatorWorkspaceStore);
    await store.loadConfiguration();
    store.setConfigurationPrivacyContact({
      dataControllerName: 'Example Operator s.r.o.',
      privacyContactEmail: ''
    });

    await store.saveConfiguration('save-privacy-contact');

    expect(store.configurationPrivacyContactValidationKey())
      .toBe('operator.configuration.privacy.contact.incomplete');
    expect(saveConfiguration).not.toHaveBeenCalled();
  });
 it('clears write-only Firebase credentials when the popup closes',async()=>{
  loadConfiguration.mockResolvedValue(operatorConfiguration());const store=TestBed.inject(OperatorWorkspaceStore);await store.loadConfiguration();
  store.setConfigurationFirebase({authenticationCredential:'temporary-auth',messagingCredential:'temporary-push'});
  store.setConfigurationMessagingDestinationToken('temporary-device');store.clearConfigurationCredentialDrafts();
  expect(store.configurationDraft()?.firebase.authenticationCredential).toBe('');expect(store.configurationDraft()?.firebase.messagingCredential).toBe('');
  expect(store.configurationMessagingDestinationToken()).toBe('');
 });
it('keeps HTTPS toggles in the draft until the TLS block is saved', async () => {
    const workspace = TestBed.inject(OperatorWorkspaceStore);
    loadConfiguration.mockResolvedValue(operatorConfiguration());
    await workspace.loadConfiguration();

    workspace.setTlsConfiguration({
      enabled: true,
      domain: 'app.example.test',
      contactEmail: 'operator@example.test',
      autoRenew: false
    });

    expect(saveTlsConfiguration).not.toHaveBeenCalled();
    saveTlsConfiguration.mockResolvedValue({
      jobId: 'tls_0123456789abcdef0123456789abcdef',
      phase: 'COMPLETED',
      percent: 100,
      message: 'operator.configuration.tls.saved',
      updatedAt: '2026-07-29T18:00:00.000Z',
      configuration: {
        capability: 'AVAILABLE',
        unavailableReason: null,
        enabled: true,
        mode: 'AUTOMATIC',
        domain: 'app.example.test',
        contactEmail: 'operator@example.test',
        autoRenew: false,
        certificateConfigured: true,
        certificateIssuer: 'Let’s Encrypt',
        certificateExpiresAt: '2026-10-27T18:00:00.000Z',
        updatedAt: '2026-07-29T18:00:00.000Z'
      }
    });

    await workspace.saveTlsConfiguration();

    expect(saveTlsConfiguration).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        domain: 'app.example.test',
        autoRenew: false
      })
    );
    expect(workspace.tlsConfiguration()?.enabled).toBe(true);
    expect(workspace.tlsConfiguration()?.updatedAt)
      .toBe('2026-07-29T18:00:00.000Z');
  });
it('flashes TLS test feedback like the Firebase header tests', async () => {
    vi.useFakeTimers();
    const workspace = TestBed.inject(OperatorWorkspaceStore);
    loadConfiguration.mockResolvedValue(operatorConfiguration());
    await workspace.loadConfiguration();
    workspace.setTlsConfiguration({
      enabled: true,
      domain: 'app.example.test',
      contactEmail: 'operator@example.test'
    });
    testTlsConfiguration.mockResolvedValue({
      jobId: 'tls_0123456789abcdef0123456789abcdef',
      phase: 'COMPLETED',
      percent: 100,
      message: 'operator.configuration.tls.test.domain.success',
      updatedAt: '2026-07-30T09:00:00.000Z',
      configuration: null
    });

    await workspace.testTlsConfiguration('DOMAIN');

    expect(workspace.tlsDomainFeedback()).toBe('success');
    vi.advanceTimersByTime(1000);
    expect(workspace.tlsDomainFeedback()).toBeNull();
  });
it('flashes TLS save success and error feedback for one second', async () => {
    vi.useFakeTimers();
    const workspace = TestBed.inject(OperatorWorkspaceStore);
    loadConfiguration.mockResolvedValue(operatorConfiguration());
    await workspace.loadConfiguration();
    workspace.setTlsConfiguration({
      enabled: true,
      domain: 'app.example.test',
      contactEmail: 'operator@example.test'
    });
    saveTlsConfiguration.mockResolvedValue({
      jobId: 'tls_0123456789abcdef0123456789abcdef',
      phase: 'COMPLETED',
      percent: 100,
      message: 'operator.configuration.tls.saved',
      updatedAt: '2026-07-30T09:00:00.000Z',
      configuration: {
        capability: 'AVAILABLE',
        unavailableReason: null,
        enabled: true,
        mode: 'AUTOMATIC',
        domain: 'app.example.test',
        contactEmail: 'operator@example.test',
        autoRenew: true,
        certificateConfigured: true,
        certificateIssuer: 'Let’s Encrypt',
        certificateExpiresAt: '2026-10-28T09:00:00.000Z',
        updatedAt: '2026-07-30T09:00:00.000Z'
      }
    });

    await workspace.saveTlsConfiguration();

    expect(workspace.tlsSaveFeedback()).toBe('success');
    vi.advanceTimersByTime(1000);
    expect(workspace.tlsSaveFeedback()).toBeNull();

    saveTlsConfiguration.mockRejectedValue(new Error('TLS save failed'));
    await workspace.saveTlsConfiguration();

    expect(workspace.tlsSaveFeedback()).toBe('error');
    vi.advanceTimersByTime(1000);
    expect(workspace.tlsSaveFeedback()).toBeNull();
  });
it('reports completion once through progress without a duplicate success notice', async () => {
    const completed: OperatorDeploymentUpdateDto = {
      ...deploymentUpdate('1.0.0-qa.2'), currentVersion: '1.0.0-qa.2', updateAvailable: false,
      progress: { phase: 'COMPLETED', percent: 100, bytesDownloaded: 100,
        bytesTotal: 100, message: null, updatedAt: null }
    };
    applyDeploymentUpdate.mockResolvedValue(completed);
    const store = TestBed.inject(OperatorWorkspaceStore);
    await store.applyDeploymentUpdate();
    expect(store.deploymentUpdate()).toEqual(completed);
    expect(store.notice()).toBe('');
    expect(reloadAfterDeploymentChange).toHaveBeenCalledTimes(1);
    expect(store.busyAction()).toBeNull();
  });
it('keeps a failed update message only in the progress result and releases busy state', async () => {
    const failed = { currentVersion: '1.0.0-qa.1', availableVersion: '1.0.0-qa.2',
      updateAvailable: true, lastCheckedAt: null, lastUpdatedAt: null,
      progress: { phase: 'FAILED' as const, percent: 20, bytesDownloaded: 10, bytesTotal: 100,
        message: 'operator.update.error.failed', updatedAt: null } };
    applyDeploymentUpdate.mockResolvedValue(failed);
    const store = TestBed.inject(OperatorWorkspaceStore);
    await store.applyDeploymentUpdate();
    expect(store.deploymentUpdate()).toEqual(failed);
    expect(reloadAfterDeploymentChange).not.toHaveBeenCalled();
    expect(store.error()).toBe('');
    expect(store.busyAction()).toBeNull();
  });
it('reloads after a successful rollback and keeps actions busy while refreshing the worker', async () => {
    const completed: OperatorDeploymentUpdateDto = {
      ...deploymentUpdate('1.0.0-qa.1'),
      progress: { phase: 'COMPLETED', percent: 100, bytesDownloaded: 100,
        bytesTotal: 100, message: null, updatedAt: null }
    };
    rollbackDeploymentUpdate.mockResolvedValue(completed);
    const store = TestBed.inject(OperatorWorkspaceStore);
    reloadAfterDeploymentChange.mockImplementation(async () => {
      expect(store.deploymentUpdate()).toEqual(completed);
      expect(store.busyAction()).toBe('rollback-update');
    });
    await store.rollbackDeploymentUpdate();
    expect(reloadAfterDeploymentChange).toHaveBeenCalledTimes(1);
  });
it('shows the actual rollback target during installation and does not reload before completion', async () => {
    const baseline = { ...deploymentUpdate('1.0.0-qa.2'),
      currentVersion: '1.0.0-qa.2', rollback: { jobId: 'completed-update',
        fromVersion: '1.0.0-qa.2', targetVersion: '1.0.0-qa.1', artifactSha256: 'verified-digest' } };
    loadDeploymentUpdate.mockResolvedValue(baseline);
    const store = TestBed.inject(OperatorWorkspaceStore);
    await store.loadDeploymentUpdate();
    rollbackDeploymentUpdate.mockImplementation(async onProgress => {
      const progress = { phase: 'WAITING_FOR_HEALTH', percent: 96, bytesDownloaded: 100,
        bytesTotal: 100, message: null, updatedAt: null };
      onProgress(progress);
      expect(store.deploymentUpdate()?.availableVersion).toBe('1.0.0-qa.1');
      expect(reloadAfterDeploymentChange).not.toHaveBeenCalled();
      return { ...baseline, progress };
    });
    await store.rollbackDeploymentUpdate();
    expect(reloadAfterDeploymentChange).not.toHaveBeenCalled();
  });
it('does not reload when a completed historical job is loaded again', async () => {
    loadDeploymentUpdate.mockResolvedValue({ ...deploymentUpdate('1.0.0-qa.2'),
      progress: { phase: 'COMPLETED', percent: 100, bytesDownloaded: 100,
        bytesTotal: 100, message: null, updatedAt: null } });
    const store = TestBed.inject(OperatorWorkspaceStore);
    await store.loadDeploymentUpdate();
    await store.refreshDeploymentUpdate();
    expect(reloadAfterDeploymentChange).not.toHaveBeenCalled();
  });
it('uses the workspace update snapshot until an explicit refresh', async () => {
    const initial = deploymentUpdate('1.1.0');
    const refreshed = deploymentUpdate('1.2.0');
    loadDeploymentUpdate
      .mockResolvedValueOnce(initial)
      .mockResolvedValueOnce(refreshed);
    const store = TestBed.inject(OperatorWorkspaceStore);

    expect(await store.loadDeploymentUpdate()).toEqual(initial);
    expect(await store.loadDeploymentUpdate()).toEqual(initial);
    expect(loadDeploymentUpdate).toHaveBeenCalledTimes(1);

    expect(await store.refreshDeploymentUpdate()).toEqual(refreshed);
    expect(store.deploymentUpdate()).toEqual(refreshed);
    expect(loadDeploymentUpdate).toHaveBeenCalledTimes(2);
  });
});
function operatorConfiguration(): OperatorConfigurationDto {
  return {
    capability: 'AVAILABLE',
    unavailableReason: null,
    adminEmails: [],
    privacyContact: {
      configured: false,
      dataControllerName: '',
      privacyContactEmail: ''
    },
    socialLinks: [],
    branding: {
      productName: 'Templates',
      homeLabel: 'Your preferences come first',
      logoUrl: 'assets/logo/heart.webp',
      logoCharacterIndex: null,

      revision: 1
    },
    firebase: {
      projectId: '',
      authenticationCredentialConfigured: false,
      messagingCredentialConfigured: false,
      publicConfiguration: {
        revision: 0,
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
        measurementId: null,
        vapidKey: null
      },
      active: false,
      readyToActivate: false,
      authenticationTestedAt: null,
      messagingTestedAt: null,
      activatedAt: null
    },
    updatedAt: '2026-07-28T18:00:00.000Z'
  };
}

function deploymentUpdate(availableVersion: string): OperatorDeploymentUpdateDto {
  return {
    currentVersion: '1.0.0',
    availableVersion,
    updateAvailable: true,
    lastCheckedAt: '2026-07-28T18:00:00.000Z',
    lastUpdatedAt: null,
    progress: {
      phase: 'IDLE',
      bytesDownloaded: 0,
      bytesTotal: 1024,
      percent: 0,
      message: null,
      updatedAt: '2026-07-28T18:00:00.000Z'
    }
  };
}
