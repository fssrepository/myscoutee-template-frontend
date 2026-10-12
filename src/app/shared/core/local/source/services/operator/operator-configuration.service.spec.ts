import '@angular/compiler';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { LocalMemoryDb } from '../../../../common/app.db';
import { RouteDelayService } from '../../../../base/services/platform/route-delay.service';
import type { OperatorConfigurationSaveRequestDto } from '../../../../contracts/operator/operator.interface';
import type { OperatorDeploymentStateRecord } from '../../entity/operator/operator.entity';
import { LocalDeploymentConfigurationRepository } from '../../repositories/platform/deployment-configuration.repository';
import { SeedOperatorConfigurationRepository } from '../../../seed/repositories/operator/operator-configuration-seed.repository';
import { LocalOperatorConfigurationService } from './operator-configuration.service';

function setup() {
  let persisted: OperatorDeploymentStateRecord | null = null;
  const db = { whenReady: vi.fn().mockResolvedValue(undefined),
    readIndexedDbTableEntry: vi.fn(async () => structuredClone(persisted)),
    writeIndexedDbTableEntry: vi.fn(async (_key: string, value: OperatorDeploymentStateRecord) => { persisted = structuredClone(value); }) };
  const injector = createEnvironmentInjector([
    { provide: LocalMemoryDb, useValue: db },
    { provide: RouteDelayService, useValue: { waitForRouteDelay: vi.fn().mockResolvedValue(undefined) } },
    LocalDeploymentConfigurationRepository, SeedOperatorConfigurationRepository, LocalOperatorConfigurationService
  ], null as any);
  return { injector, db, repo: injector.get(LocalDeploymentConfigurationRepository),
    service: injector.get(LocalOperatorConfigurationService), seed: injector.get(SeedOperatorConfigurationRepository),
    persisted: () => persisted };
}
async function request(service: LocalOperatorConfigurationService): Promise<OperatorConfigurationSaveRequestDto> {
  const value = await service.loadConfiguration();
  return { adminEmails: value.adminEmails, privacyContact: value.privacyContact, socialLinks: value.socialLinks,
    branding: value.branding, integration: { publicBaseUrl: value.integration?.publicBaseUrl ?? '' },
    firebase: { ...value.firebase.publicConfiguration, measurementId: value.firebase.publicConfiguration.measurementId ?? '',
      vapidKey: value.firebase.publicConfiguration.vapidKey ?? '', authenticationCredential: '', messagingCredential: '' } };
}

describe('Local operator configuration persistence', () => {
  it('seeds once, preserves edited settings and reads the hydrated graph', async () => {
    const f = setup();
    try {
      await f.seed.seedDefaults();
      const draft = await request(f.service); draft.branding.productName = 'Another project';
      draft.adminEmails = ['ADMIN@Example.test', 'admin@example.test'];
      draft.integration = { publicBaseUrl: 'https://api.example.test/api/integrations/v1/' };
      await f.service.saveConfiguration(draft); await f.seed.seedDefaults();
      expect((await f.service.loadConfiguration()).adminEmails).toEqual(['admin@example.test']);
      expect((await f.repo.readPublicConfiguration()).productName).toBe('Another project');
      expect((await f.service.loadConfiguration()).integration?.publicBaseUrl).toBe('https://api.example.test/api/integrations/v1');
      expect(f.db.writeIndexedDbTableEntry).toHaveBeenCalledTimes(2);
      expect(f.db.readIndexedDbTableEntry).toHaveBeenCalledTimes(1);
      const reloaded = runInInjectionContext(f.injector, () => new LocalDeploymentConfigurationRepository());
      expect((await reloaded.readPublicConfiguration()).productName).toBe('Another project');
      expect(await reloaded.readPublicConfiguration()).not.toHaveProperty('adminEmails');
    } finally { f.injector.destroy(); }
  });

  it('retains only credential presence and invalidates verification on Firebase changes', async () => {
    const f = setup();
    try {
      await f.seed.seedDefaults();
      const draft = await request(f.service);
      draft.firebase = { ...draft.firebase, projectId: 'template-test', apiKey: 'public-key', authDomain: 'template-test.firebaseapp.com',
        messagingSenderId: '123', appId: '1:123:web:test', vapidKey: 'public-vapid', authenticationCredential: 'private-auth-sentinel', messagingCredential: 'private-push-sentinel' };
      const saved = await f.service.saveConfiguration(draft);
      expect(saved.firebase.authenticationCredentialConfigured).toBe(true);
      expect(saved.firebase.messagingCredentialConfigured).toBe(true);
      expect(saved.firebase.active).toBe(false); expect(saved.firebase.readyToActivate).toBe(false);
      expect(JSON.stringify(f.persisted())).not.toContain('private-auth-sentinel');
      expect(JSON.stringify(f.persisted())).not.toContain('private-push-sentinel');
      await expect(f.service.activateFirebase()).rejects.toThrow();
      const plain = await request(f.service); plain.branding.productName = 'Renamed project';
      expect((await f.service.saveConfiguration(plain)).firebase.publicConfiguration.revision).toBe(saved.firebase.publicConfiguration.revision);
      plain.firebase.apiKey = 'new-public-key';
      const changed = await f.service.saveConfiguration(plain);
      expect(changed.firebase.publicConfiguration.revision).toBe(saved.firebase.publicConfiguration.revision + 1);
      expect(changed.firebase.authenticationTestedAt).toBeNull(); expect(changed.firebase.messagingTestedAt).toBeNull();
    } finally { f.injector.destroy(); }
  });

  it('rejects partial privacy and unsafe API URLs without changing persisted settings', async () => {
    const f = setup();
    try {
      await f.seed.seedDefaults(); const before = structuredClone(f.persisted());
      const draft = await request(f.service); draft.privacyContact = { dataControllerName: 'Controller', privacyContactEmail: '' };
      await expect(f.service.saveConfiguration(draft)).rejects.toThrow('operator.configuration.privacy.contact.incomplete');
      draft.privacyContact = { dataControllerName: '', privacyContactEmail: '' }; draft.integration = { publicBaseUrl: 'http://public.example.test' };
      await expect(f.service.saveConfiguration(draft)).rejects.toThrow();
      expect(f.persisted()).toEqual(before);
    } finally { f.injector.destroy(); }
  });
  it('keeps local TLS state separate and never persists supplied private keys', async () => {
    const f = setup();
    try {
      await f.seed.seedDefaults();
      expect((await f.service.loadTlsConfiguration()).enabled).toBe(false);
      const job = await f.service.saveTlsConfiguration({ enabled: true, mode: 'MANUAL', domain: ' APP.EXAMPLE.TEST ',
        contactEmail: '', autoRenew: false, certificate: 'local-certificate-sentinel', privateKey: 'local-private-key-sentinel' });
      expect(job.phase).toBe('COMPLETED');
      expect((await f.service.loadTlsConfiguration()).domain).toBe('app.example.test');
      expect(JSON.stringify(f.persisted())).not.toContain('local-private-key-sentinel');
      expect(JSON.stringify(f.persisted())).not.toContain('local-certificate-sentinel');
      const draft = await request(f.service); draft.branding.productName = 'Updated brand';
      await f.service.saveConfiguration(draft);
      expect((await f.service.loadTlsConfiguration()).certificateConfigured).toBe(true);
      const reloaded = runInInjectionContext(f.injector, () => new LocalDeploymentConfigurationRepository());
      expect((await reloaded.read())?.tlsConfiguration?.mode).toBe('MANUAL');
      expect(await reloaded.readPublicConfiguration()).not.toHaveProperty('tlsConfiguration');
    } finally { f.injector.destroy(); }
  });

});
