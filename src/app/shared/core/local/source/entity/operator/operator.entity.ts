import type {OperatorDeploymentUpdateDto} from '../../../../contracts/operator/operator-update.interface';
import type { OperatorConfigurationDto, OperatorTlsConfigurationDto } from '../../../../contracts/operator/operator.interface';

// Selected deployment configuration; no virtual-company Registry state.
export interface OperatorDeploymentStateRecord { configuration: OperatorConfigurationDto; deploymentUpdate?: OperatorDeploymentUpdateDto; tlsConfiguration?: OperatorTlsConfigurationDto; }
