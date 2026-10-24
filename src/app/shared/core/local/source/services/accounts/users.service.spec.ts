import { LocalUsersService } from './users.service';
import { LocalCountryPartitionsRepository } from '../../repositories/platform/country-partitions.repository';
import { UserDto } from '../../../../contracts/accounts/user.interface';

describe('Offline user location policy', () => {
  afterEach(() => vi.restoreAllMocks());

  it('assigns the first local profile save a supported partition and sample location', async () => {
    const records = new Map<string, UserDto>();
    const service = Object.assign(Object.create(LocalUsersService.prototype), {
      countryPartitionsRepository: new LocalCountryPartitionsRepository(),
      waitForRouteDelay: async () => {},
      usersRepository: {
        whenReady: async () => {}, queryUserById: (id: string) => records.get(id),
        upsertUser: (user: UserDto) => { records.set(user.id, user); return user; }, flushToIndexedDb: async () => {}
      }
    });
    const random = vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation(sample => {
      (sample as Uint32Array)[0] = 2;
      return sample;
    });
    const saved = await service.saveUserProfile({ ...new UserDto(), id: 'new-local-account' });
    expect(saved.partitionKey).toBe('country:gb');
    expect(saved.locationCoordinates).toEqual({ latitude: 51.5074, longitude: -0.1278 });
    await service.saveUserProfile({ ...saved, name: 'Edited' });
    expect(random).toHaveBeenCalledOnce();
  });
  it('accepts valid coordinates without country geometry and rejects malformed coordinates', async () => {
    const service = Object.assign(Object.create(LocalUsersService.prototype), {
      countryPartitionsRepository: new LocalCountryPartitionsRepository()
    });
    await expect(service.checkLocationEligibility({ latitude: 30.2672, longitude: -97.7431 }))
      .resolves.toMatchObject({ eligible: true, securityGateEnabled: false, locationRequired: false });
    await expect(service.checkLocationEligibility({ latitude: 91, longitude: 19 }))
      .resolves.toMatchObject({ eligible: false });
  });

  it('uses stored partitions for demo selection without inferring a country from coordinates', async () => {
    const service = Object.assign(Object.create(LocalUsersService.prototype), {
      waitForRouteDelay: vi.fn().mockResolvedValue(undefined),
      usersRepository: { whenReady: async () => {}, queryAvailableDemoUsers: () => [
        { id: 'assigned', partitionKey: 'country:gb', locationCoordinates: { latitude: 30.2672, longitude: -97.7431 } },
        { id: 'missing', locationCoordinates: { latitude: 52.52, longitude: 13.405 } }
      ] }
    });
    const members = await service.queryAvailableDemoUsers('member');
    expect(members.map((user: { locationRequired: boolean }) => user.locationRequired)).toEqual([false, true]);
  });
});
