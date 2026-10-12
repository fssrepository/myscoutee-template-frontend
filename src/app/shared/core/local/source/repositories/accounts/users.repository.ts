import { Injectable, computed, inject } from '@angular/core';
import { LocalMemoryDb } from '../../../../common/app.db';
import { hasOperatorRole } from '../../../../common/user-role';
import { USERS_TABLE_NAME, type UserRecord } from '../../entity/accounts/user.entity';
import type { UserSelectorRole, UserDto } from '../../../../contracts/accounts/user.interface';
import { LocalUsersMapper } from '../../mappers/accounts/user.mapper';
@Injectable({ providedIn: 'root' })
export class LocalUsersRepository {
  private readonly memoryDb = inject(LocalMemoryDb);

  readonly usersTable = computed(() => this.memoryDb.read()[USERS_TABLE_NAME]);

  readonly demoUsers = computed(() => this.queryAvailableDemoUsers());

  async whenReady(): Promise<void> {
    await this.memoryDb.whenReady();
  }

  async flushToIndexedDb(): Promise<void> {
    await this.memoryDb.flushToIndexedDb();
  }

  queryAvailableDemoUsers(selectorRole: UserSelectorRole = 'member'): UserRecord[] {
    return this.queryUserRecordsFromTable(USERS_TABLE_NAME)
      .filter(user => this.matchesSelectorRole(user, selectorRole))
      .sort((left, right) => this.compareSelectableDemoUsers(left, right));
  }

  private matchesSelectorRole(user: UserRecord, selectorRole: UserSelectorRole): boolean {
    const adminUser = user.admin === true;
    const operatorUser = hasOperatorRole(user);
    if (selectorRole === 'admin') {
      return adminUser;
    }
    if (selectorRole === 'operator') {
      return operatorUser;
    }
    return !adminUser && !operatorUser;
  }

  private compareSelectableDemoUsers(left: UserRecord, right: UserRecord): number {
    const nameDelta = this.demoSelectorSortText(left.name, left.id)
      .localeCompare(this.demoSelectorSortText(right.name, right.id), 'en', { sensitivity: 'base' });
    if (nameDelta !== 0) {
      return nameDelta;
    }
    return `${left.id ?? ''}`.trim()
      .localeCompare(`${right.id ?? ''}`.trim(), 'en', { sensitivity: 'base' });
  }

  private demoSelectorSortText(name: string | null | undefined, userId: string | null | undefined): string {
    return `${name ?? ''}`.trim() || `${userId ?? ''}`.trim();
  }

  queryAllUsers(): UserDto[] {
    return this.queryUsersFromTable(USERS_TABLE_NAME);
  }

  queryUserById(userId: string): UserRecord | null {
    const user = this.memoryDb.read()[USERS_TABLE_NAME].byId[userId];
    if (!user) {
      return null;
    }
    return user;
  }

  private queryUsersFromTable(tableName: typeof USERS_TABLE_NAME): UserDto[] {
    return this.queryUserRecordsFromTable(tableName)
      .map(user => LocalUsersMapper.toDto(user));
  }

  private queryUserRecordsFromTable(tableName: typeof USERS_TABLE_NAME): UserRecord[] {
    const users = this.memoryDb.read()[tableName];
    return users.ids
      .map(id => users.byId[id])
      .filter((user): user is UserRecord => Boolean(user));
  }
 upsertUser(user: UserRecord): UserRecord {
  this.memoryDb.write(state => {
   const table = state[USERS_TABLE_NAME];
   const previous = table.byId[user.id];
   return { ...state, [USERS_TABLE_NAME]: {
    byId: { ...table.byId, [user.id]: { ...previous, ...user, devices: previous?.devices } },
    ids: previous ? [...table.ids] : [...table.ids, user.id]
   } };
  });
  return this.queryUserById(user.id)!;
 }
}
