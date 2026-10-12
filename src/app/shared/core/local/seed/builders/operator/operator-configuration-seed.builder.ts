import version from '../../../../../../../app-version.json';
import type {OperatorDeploymentUpdateDto} from '../../../../contracts/operator/operator-update.interface';
import type {DeploymentConfigurationDto} from '../../../../contracts/platform/deployment-configuration.interface';
import type {OperatorDeploymentStateRecord} from '../../../source/entity/operator/operator.entity';

/** Selected configuration seed from SeedOperatorRegistryBuilder; no company, ledger or product state. */
export class SeedOperatorConfigurationBuilder {
 static build(publicConfiguration:DeploymentConfigurationDto,now=new Date()):OperatorDeploymentStateRecord {
  return {deploymentUpdate:this.updateDefaults(now),configuration:{capability:'AVAILABLE',unavailableReason:null,adminEmails:[],
   privacyContact:structuredClone(publicConfiguration.privacyContact),socialLinks:structuredClone(publicConfiguration.socialLinks),
   branding:{productName:publicConfiguration.productName,homeLabel:publicConfiguration.homeLabel,logoUrl:publicConfiguration.logoUrl,
    logoCharacterIndex:publicConfiguration.logoCharacterIndex,revision:publicConfiguration.revision},
   integration:{publicBaseUrl:'http://localhost/api/integrations/v1'},
   firebase:{projectId:'',authenticationCredentialConfigured:false,messagingCredentialConfigured:false,
    publicConfiguration:{revision:0,apiKey:'',authDomain:'',projectId:'',storageBucket:'',messagingSenderId:'',appId:'',measurementId:null,vapidKey:null},
    active:false,readyToActivate:false,authenticationTestedAt:null,messagingTestedAt:null,activatedAt:null},updatedAt:now.toISOString()}};
 }
 static updateDefaults(now=new Date()):OperatorDeploymentUpdateDto {
  return {currentVersion:version.version,availableVersion:version.version,updateAvailable:false,lastCheckedAt:now.toISOString(),lastUpdatedAt:null,
   progress:{phase:'IDLE',bytesDownloaded:0,bytesTotal:0,percent:0,message:null,updatedAt:now.toISOString()}};
 }
}
