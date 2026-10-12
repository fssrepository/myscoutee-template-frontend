import {Injectable,inject} from '@angular/core';
import {LocalDeploymentConfigurationRepository} from '../../../source/repositories/platform/deployment-configuration.repository';
import {SeedOperatorConfigurationBuilder} from '../../builders/operator/operator-configuration-seed.builder';
@Injectable({providedIn:'root'})
export class SeedOperatorConfigurationRepository {
 private readonly repository=inject(LocalDeploymentConfigurationRepository);
 async seedDefaults():Promise<void>{
  const existing=await this.repository.read();
  if(existing){
   if(!existing.deploymentUpdate)await this.repository.write({...existing,deploymentUpdate:SeedOperatorConfigurationBuilder.updateDefaults()});
   return;
  }
  await this.repository.write(SeedOperatorConfigurationBuilder.build(await this.repository.readPublicConfiguration()));
 }
}
