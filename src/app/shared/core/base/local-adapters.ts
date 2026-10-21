import { LocalDeviceRegistrationsService } from '../local/source/services/accounts/device-registrations.service';
import { LocalUsersService } from '../local/source/services/accounts/users.service';
import { LocalChatsService } from '../local/source/services/chat/chats.service';
import { LocalOperatorEmailService } from '../local/source/services/email/operator-email.service';
import { LocalHelpCenterService } from '../local/source/services/help/help-center.service';
import { LocalIntegrationService } from '../local/source/services/integrations/integration.service';
import { LocalMediaService } from '../local/source/services/media/media.service';
import { LocalNotificationsService } from '../local/source/services/notifications/notifications.service';
import { LocalOperatorConfigurationService } from '../local/source/services/operator/operator-configuration.service';
import { LocalOperatorUpdateService } from '../local/source/services/operator/operator-update.service';
import { LocalDeploymentConfigurationService } from '../local/source/services/platform/deployment-configuration.service';
import { LocalShowcaseService } from '../local/source/services/showcase/showcase.service';

export const LOCAL_ADAPTER_TYPES = {
  LocalDeviceRegistrationsService,
  LocalUsersService,
  LocalChatsService,
  LocalOperatorEmailService,
  LocalHelpCenterService,
  LocalIntegrationService,
  LocalMediaService,
  LocalNotificationsService,
  LocalOperatorConfigurationService,
  LocalOperatorUpdateService,
  LocalDeploymentConfigurationService,
  LocalShowcaseService
} as const;
