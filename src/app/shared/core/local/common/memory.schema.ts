import type { NotificationsMemorySchema } from '../source/entity/notifications/notification.entity';
import type { UsersMemorySchema } from '../source/entity/accounts/user.entity';
import type { HelpCenterMemorySchema } from '../source/entity/content/content.entity';
import type { ShowcaseMemorySchema } from '../source/entity/showcase/showcase.entity';
import type { ChatsMemorySchema } from '../source/entity/chat/chat.entity';
import type { ContactsMemorySchema } from '../source/entity/accounts/profile.entity';
export type AppMemorySchema = NotificationsMemorySchema & UsersMemorySchema & HelpCenterMemorySchema & ShowcaseMemorySchema & ChatsMemorySchema & ContactsMemorySchema;
