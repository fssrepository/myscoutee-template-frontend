import { HTTP_ENTRY_ADAPTER_TYPES } from './http-entry-adapters';
import { HttpDeviceRegistrationsService } from '../http/services/accounts/device-registrations.service';
import { HttpChatsService } from '../http/services/chat/chats.service';
import { HttpOperatorEmailService } from '../http/services/email/operator-email.service';
import { HttpIntegrationService } from '../http/services/integrations/integration.service';
import { HttpNotificationsService } from '../http/services/notifications/notifications.service';
import { HttpOperatorConfigurationService } from '../http/services/operator/operator-configuration.service';
import { HttpOperatorUpdateService } from '../http/services/operator/operator-update.service';
import { HttpShowcaseService } from '../http/services/showcase/showcase.service';

export const HTTP_ADAPTER_TYPES = {
  ...HTTP_ENTRY_ADAPTER_TYPES,
  HttpDeviceRegistrationsService,
  HttpChatsService,
  HttpOperatorEmailService,
  HttpIntegrationService,
  HttpNotificationsService,
  HttpOperatorConfigurationService,
  HttpOperatorUpdateService,
  HttpShowcaseService
} as const;
