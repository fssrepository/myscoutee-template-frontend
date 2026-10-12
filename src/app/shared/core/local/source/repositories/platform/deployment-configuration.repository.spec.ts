import '@angular/compiler';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { LocalMemoryDb } from '../../../../common/app.db';
import { LocalDeploymentConfigurationRepository } from './deployment-configuration.repository';
import type { OperatorDeploymentStateRecord } from '../../entity/operator/operator.entity';

describe('Local deployment configuration ownership', () => {
 it('hydrates once and exposes only the public projection while retaining operator configuration', async () => {
  let stored: OperatorDeploymentStateRecord | null = null;
  const db={whenReady:vi.fn().mockResolvedValue(undefined),readIndexedDbTableEntry:vi.fn(async()=>stored),
   writeIndexedDbTableEntry:vi.fn(async(_key:string,value:OperatorDeploymentStateRecord)=>{stored=value;}),
   deleteIndexedDbTableEntry:vi.fn(async()=>{stored=null;})};
  const injector=createEnvironmentInjector([{provide:LocalMemoryDb,useValue:db}],null as any);
  const repo=runInInjectionContext(injector,()=>new LocalDeploymentConfigurationRepository());
  try {
   const initial=await repo.readPublicConfiguration();expect(initial.productName).toBe('MyScoutee');expect(db.writeIndexedDbTableEntry).not.toHaveBeenCalled();
   const record: OperatorDeploymentStateRecord={configuration:{capability:'AVAILABLE',unavailableReason:null,adminEmails:['private@example.test'],
    privacyContact:{configured:true,dataControllerName:'Controller',privacyContactEmail:'privacy@example.test'},socialLinks:[],
    branding:{productName:'New project',homeLabel:'Home',logoUrl:'assets/logo/heart.webp',logoCharacterIndex:0,revision:2},
    integration:{publicBaseUrl:'https://example.test/api/integrations/v1'},
    firebase:{projectId:'private-project',authenticationCredentialConfigured:true,messagingCredentialConfigured:true,
     active:true,readyToActivate:true,authenticationTestedAt:null,messagingTestedAt:null,activatedAt:null,
     publicConfiguration:{revision:1,apiKey:'firebase-public-key',authDomain:'auth.example.test',projectId:'private-project',storageBucket:'',messagingSenderId:'',appId:'app',measurementId:null,vapidKey:null}},updatedAt:null}};
   await repo.write(record);record.configuration.branding.productName='Changed caller';
   const value=await repo.readPublicConfiguration();expect(value.productName).toBe('New project');expect(value.firebaseMessagingConfigured).toBe(true);
   expect(value).not.toHaveProperty('adminEmails');expect(value).not.toHaveProperty('firebase');expect(value).not.toHaveProperty('integration');
   value.privacyContact.dataControllerName='Changed reader';expect((await repo.read())?.configuration.privacyContact.dataControllerName).toBe('Controller');
   expect((await repo.read())?.configuration.integration?.publicBaseUrl).toBe('https://example.test/api/integrations/v1');
   expect(db.readIndexedDbTableEntry).toHaveBeenCalledTimes(1);
   const reloaded=runInInjectionContext(injector,()=>new LocalDeploymentConfigurationRepository());
   expect((await reloaded.readPublicConfiguration()).productName).toBe('New project');
   await reloaded.clear();expect(stored).toBeNull();expect((await reloaded.readPublicConfiguration()).productName).toBe('MyScoutee');
  } finally {injector.destroy();}
 });
});
