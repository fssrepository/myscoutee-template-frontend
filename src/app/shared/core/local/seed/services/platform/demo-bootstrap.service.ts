
import {SeedOperatorConfigurationRepository} from '../../repositories/operator/operator-configuration-seed.repository';
import { SeedNotificationsRepository } from '../../repositories/notifications/notifications-seed.repository';
import { SeedChatsRepository } from '../../repositories/chat/chats-seed.repository';
import type { BootstrapProcessListener } from '../../../../base/services/platform/bootstrap.service';
import { Injectable, inject } from '@angular/core';
import { LocalMemoryDb } from '../../../../common/app.db';
import { SeedShowcaseRepository } from '../../repositories/showcase/showcase-seed.repository';
import { SeedUsersRepository } from '../../repositories/accounts/users-seed.repository';
import { SeedStaticContentService } from './static-content.service';
export type SeedDemoBootstrapMode = 'member' | 'operator' | 'admin' | 'union';
@Injectable({ providedIn: 'root' })
export class SeedDemoBootstrapService {
 private readonly operatorConfiguration=inject(SeedOperatorConfigurationRepository);
 private readonly memoryDb = inject(LocalMemoryDb);
 private readonly users = inject(SeedUsersRepository);
 private readonly notifications = inject(SeedNotificationsRepository);
 private readonly chats = inject(SeedChatsRepository);
 private readonly showcase = inject(SeedShowcaseRepository);
 private readonly content = inject(SeedStaticContentService);
 private selectorPromise: Promise<void> | null = null;
 private selectorReady = false;
 async ensureDemoSelectorReady(_mode: SeedDemoBootstrapMode = 'member', onProgress?: BootstrapProcessListener): Promise<void> {
  if (this.selectorReady) return;
  if (!this.selectorPromise) this.selectorPromise = this.runBootstrap().finally(() => { this.selectorPromise = null; });
  await this.selectorPromise;
  onProgress?.({ percent: 100, label: 'Demo data ready', stage: 'ready' });
 }
 async ensureUserReady(userId: string, mode: SeedDemoBootstrapMode = 'member', onProgress?: BootstrapProcessListener): Promise<void> {
  await this.ensureDemoSelectorReady(mode);
  if (!this.memoryDb.read().users.byId[userId]) throw new Error('Demo user not found.');
  onProgress?.({ percent: 100, label: 'Demo session ready', stage: 'sessionReady' });
 }
 private async runBootstrap(): Promise<void> {
  await this.memoryDb.whenReady();
  this.users.seedDefaults();
  this.showcase.seedDefaults();
  this.chats.seedDefaults();
  for (const userId of this.memoryDb.read().users.ids) this.notifications.seedForUser(userId);
  await this.content.ensureReady();
  await this.operatorConfiguration.seedDefaults();
  await this.memoryDb.flushToIndexedDb();
  this.selectorReady = true;
 }
}
