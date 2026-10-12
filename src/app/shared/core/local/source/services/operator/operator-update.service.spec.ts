import '@angular/compiler';
import {createEnvironmentInjector,runInInjectionContext} from '@angular/core';
import {describe,expect,it,vi} from 'vitest';
import {LocalMemoryDb} from '../../../../common/app.db';
import {RouteDelayService} from '../../../../base/services/platform/route-delay.service';
import type {OperatorDeploymentStateRecord} from '../../entity/operator/operator.entity';
import {LocalDeploymentConfigurationRepository} from '../../repositories/platform/deployment-configuration.repository';
import {SeedOperatorConfigurationRepository} from '../../../seed/repositories/operator/operator-configuration-seed.repository';
import {LocalOperatorUpdateService} from './operator-update.service';
import {LocalRoleNotificationsService} from '../notifications/role-notifications.service';
function fixture(){
 let persisted:OperatorDeploymentStateRecord|null=null;
 const db={whenReady:vi.fn().mockResolvedValue(undefined),readIndexedDbTableEntry:vi.fn(async()=>structuredClone(persisted)),
  writeIndexedDbTableEntry:vi.fn(async(_key:string,value:OperatorDeploymentStateRecord)=>{persisted=structuredClone(value);})};
 const publish=vi.fn().mockResolvedValue(undefined);
 const injector=createEnvironmentInjector([{provide:LocalMemoryDb,useValue:db},
  {provide:RouteDelayService,useValue:{waitForRouteDelay:vi.fn().mockResolvedValue(undefined),waitForDelay:vi.fn().mockResolvedValue(undefined)}},
  {provide:LocalRoleNotificationsService,useValue:{publish}},LocalDeploymentConfigurationRepository,SeedOperatorConfigurationRepository,LocalOperatorUpdateService],null as any);
 return {injector,db,publish,repo:injector.get(LocalDeploymentConfigurationRepository),seed:injector.get(SeedOperatorConfigurationRepository),service:injector.get(LocalOperatorUpdateService)};
}
describe('Local deployment updates',()=>{
 it('starts at 1.0.0 without announcing a fictitious release; seed upgrade preserves edited configuration',async()=>{
  const f=fixture();try{
   await f.seed.seedDefaults();const old=(await f.repo.read())!;old.configuration.branding.productName='Owned project';delete old.deploymentUpdate;
   await f.repo.write(old);await f.seed.seedDefaults();await f.seed.seedDefaults();
   const update=await f.service.loadDeploymentUpdate();expect(update.currentVersion).toBe('1.0.0');expect(update.availableVersion).toBe('1.0.0');expect(update.updateAvailable).toBe(false);expect(f.publish).not.toHaveBeenCalled();
   expect((await f.repo.read())?.configuration.branding.productName).toBe('Owned project');expect(f.db.writeIndexedDbTableEntry).toHaveBeenCalledTimes(3);
  }finally{f.injector.destroy();}
 });
 it('persists every simulated update phase and final version while retaining deployment settings',async()=>{
  const f=fixture();try{
   await f.seed.seedDefaults();const original=(await f.repo.read())!;
   await f.repo.write({...original,deploymentUpdate:{...original.deploymentUpdate!,availableVersion:'1.0.1',updateAvailable:true,progress:{...original.deploymentUpdate!.progress,bytesTotal:1024}}});
   expect((await f.service.loadDeploymentUpdate()).updateAvailable).toBe(true);expect(f.publish).toHaveBeenCalledWith('release-available','1.0.1',{releaseVersion:'1.0.1'});
   const progress=vi.fn();const result=await f.service.applyDeploymentUpdate(progress);
   expect(progress.mock.calls.map(call=>call[0].phase)).toEqual(['CHECKING','DOWNLOADING','DOWNLOADING','DOWNLOADING','DOWNLOADING','VERIFYING','INSTALLING','COMPLETED']);
   expect(result.currentVersion).toBe('1.0.1');expect(result.updateAvailable).toBe(false);expect((await f.repo.read())?.configuration).toEqual(original.configuration);
   const reloaded=runInInjectionContext(f.injector,()=>new LocalDeploymentConfigurationRepository());expect((await reloaded.read())?.deploymentUpdate).toEqual(result);
   await expect(f.service.rollbackDeploymentUpdate()).rejects.toThrow('operator.update.error.rollback.unavailable');
  }finally{f.injector.destroy();}
 });
});
