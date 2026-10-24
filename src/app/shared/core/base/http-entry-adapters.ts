import { HttpDeploymentConfigurationService } from '../http/services/platform/deployment-configuration.service';
import { HttpHelpCenterService } from '../http/services/help/help-center.service';
import { HttpMediaService } from '../http/services/media/media.service';
import { HttpUsersService } from '../http/services/accounts/users.service';

// Public entry documents, configuration, authentication and media.
export const HTTP_ENTRY_ADAPTER_TYPES = {
  HttpDeploymentConfigurationService,
  HttpHelpCenterService,
  HttpMediaService,
  HttpUsersService
} as const;
