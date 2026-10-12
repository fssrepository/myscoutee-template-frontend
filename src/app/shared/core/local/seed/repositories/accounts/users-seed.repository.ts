import { Injectable, inject } from '@angular/core';
import { LocalMemoryDb } from '../../../../common/app.db';
import { USERS_TABLE_NAME, type UserRecord } from '../../../source/entity/accounts/user.entity';
import { UserDto } from '../../../../contracts/accounts/user.interface';
import users from '../../data/users.json';
@Injectable({ providedIn: 'root' })
export class SeedUsersRepository {
 private readonly memoryDb = inject(LocalMemoryDb);
 seedDefaults(): UserRecord[] {
  const table = this.memoryDb.read()[USERS_TABLE_NAME];
  const missing = users.filter(user => !Object.prototype.hasOwnProperty.call(table.byId, user.id));
  if (missing.length) this.memoryDb.write(state => ({ ...state, [USERS_TABLE_NAME]: {
   byId: { ...table.byId, ...Object.fromEntries(missing.map(user => [user.id, { ...new UserDto(), ...structuredClone(user) } as UserRecord])) },
   ids: [...table.ids, ...missing.map(user => user.id)]
  } }));
  const result = this.memoryDb.read()[USERS_TABLE_NAME];
  return result.ids.map(id => structuredClone(result.byId[id]));
 }
}
