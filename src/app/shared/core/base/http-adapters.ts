import { HttpDeviceRegistrationsService } from '../http/services/accounts/device-registrations.service';
import { HttpUsersService } from '../http/services/accounts/users.service';
import { HttpChatsService } from '../http/services/chat/chats.service';
import { HttpOperatorEmailService } from '../http/services/email/operator-email.service';
import { HttpHelpCenterService } from '../http/services/help/help-center.service';
import { HttpIntegrationService } from '../http/services/integrations/integration.service';
import { HttpMediaService } from '../http/services/media/media.service';
import { HttpNotificationsService } from '../http/services/notifications/notifications.service';
import { HttpOperatorConfigurationService } from '../http/services/operator/operator-configuration.service';
import { HttpOperatorUpdateService } from '../http/services/operator/operator-update.service';
import { HttpDeploymentConfigurationService } from '../http/services/platform/deployment-configuration.service';
import { HttpShowcaseService } from '../http/services/showcase/showcase.service';

export const HTTP_ADAPTER_TYPES = {
  HttpDeviceRegistrationsService,
  HttpUsersService,
  HttpChatsService,
  HttpOperatorEmailService,
  HttpHelpCenterService,
  HttpIntegrationService,
  HttpMediaService,
  HttpNotificationsService,
  HttpOperatorConfigurationService,
  HttpOperatorUpdateService,
  HttpDeploymentConfigurationService,
  HttpShowcaseService
} as const;
