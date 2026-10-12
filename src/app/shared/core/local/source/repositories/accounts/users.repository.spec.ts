import { TestBed } from '@angular/core/testing';
import { LocalMemoryDb } from '../../../../common/app.db';
import { UserDto } from '../../../../contracts/accounts/user.interface';
import { LocalUsersMapper } from '../../mappers/accounts/user.mapper';
import { LocalUsersRepository } from './users.repository';
import type { UserRecord, UsersRecordCollection } from '../../entity/accounts/user.entity';

describe('minimal local profile persistence', () => {
  let table: UsersRecordCollection;
  let repository: LocalUsersRepository;

  beforeEach(() => {
    table = { byId: {}, ids: [] };
    TestBed.configureTestingModule({ providers: [{
      provide: LocalMemoryDb,
      useValue: {
        read: () => ({ users: table }),
        write: (update: (state: { users: UsersRecordCollection }) => { users: UsersRecordCollection }) => {
          table = update({ users: table }).users;
        }
      }
    }] });
    repository = TestBed.inject(LocalUsersRepository);
  });

  afterEach(() => TestBed.resetTestingModule());

  it('preserves fields omitted by a small profile form and the private device records', () => {
    const original = {
      ...new UserDto(), id: 'member', name: 'Original', extension: { value: 'retained' },
      devices: [{ deviceId: 'phone', notificationsEnabled: true, token: 'private-push-token' }]
    } as unknown as UserRecord;
    table = { byId: { member: original }, ids: ['member'] };
    const saved = repository.upsertUser({ id: 'member', name: 'Changed', images: [] } as unknown as UserRecord);
    expect(saved).toMatchObject({ name: 'Changed', extension: { value: 'retained' }, devices: original.devices });
    const profile = LocalUsersMapper.toDto(saved);
    expect(profile).not.toHaveProperty('devices');
    expect(profile.notificationDevices).toEqual([{ deviceId: 'phone', notificationsEnabled: true }]);
    expect(table.ids).toEqual(['member']);
    profile.images!.push('another-image');
    expect(saved.images).toEqual([]);
  });

  it('keeps member, administrator and operator selectors distinct', () => {
    for (const [id, role] of [['member', {}], ['admin', { admin: true }], ['operator', { operator: true }]] as const) {
      repository.upsertUser({ ...new UserDto(), id, name: id, ...role });
    }
    expect(repository.queryAvailableDemoUsers('member').map(user => user.id)).toEqual(['member']);
    expect(repository.queryAvailableDemoUsers('admin').map(user => user.id)).toEqual(['admin']);
    expect(repository.queryAvailableDemoUsers('operator').map(user => user.id)).toEqual(['operator']);
  });
});
