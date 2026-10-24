import { HTTP_ADAPTER } from '../../adapter-loaders';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../../../environments/environment';
import { UserDto } from '../../../contracts/accounts/user.interface';
import { LocalUsersService } from '../../../local/source/services/accounts/users.service';
import { HttpUsersService } from '../../../http/services/accounts/users.service';
import { UserProfileStore } from '../../../../ui/context/stores/profile/user-profile.store';
import { SessionService } from './session.service';
import { UsersService } from './users.service';

describe('minimal user adapter and session boundary', () => {
  const originalMode = environment.activitiesDataSource;
  let identity: string;
  let local: { queryUserById: ReturnType<typeof vi.fn> };
  let http: { queryUserById: ReturnType<typeof vi.fn> };
  let profiles: UserProfileStore;
  let users: UsersService;

  beforeEach(() => {
    identity = 'first';
    environment.activitiesDataSource = 'http';
    local = { queryUserById: vi.fn() };
    http = { queryUserById: vi.fn() };
    TestBed.configureTestingModule({ providers: [
      { provide: SessionService, useValue: { identity: () => identity, currentSession: () => null } },
      { provide: LocalUsersService, useValue: local },
      { provide: HttpUsersService, useValue: http }
    ] });
    profiles = TestBed.inject(UserProfileStore);
    users = TestBed.inject(UsersService);
  });

  afterEach(() => { environment.activitiesDataSource = originalMode; TestBed.resetTestingModule(); });

  it('does not fall back to local data after an HTTP failure', async () => {
    http.queryUserById.mockRejectedValue(new Error('server unavailable'));
    await expect(users.loadUserById('member')).rejects.toThrow('server unavailable');
    expect(local.queryUserById).not.toHaveBeenCalled();
    expect(profiles.activeUserProfile()).toBeNull();
  });

  it('does not publish a late profile after the session changes', async () => {
    let resolve!: (result: { user: UserDto }) => void;
    http.queryUserById.mockReturnValue(new Promise(result => { resolve = result; }));
    const request = users.loadUserById('first');
    identity = 'second';
    resolve({ user: { ...new UserDto(), id: 'first' } });
    expect(await request).toBeNull();
    expect(profiles.activeUserProfile()).toBeNull();
  });

  it('reuses the loaded profile only for the same session', async () => {
    const profile = { ...new UserDto(), id: 'member', name: 'Alex' };
    http.queryUserById.mockResolvedValue({ user: profile });
    await users.loadUserById('member');
    expect(users.peekCurrentUser()?.id).toBe('member');
    identity = 'replacement';
    expect(users.peekCurrentUser()).toBeNull();
  });
});


describe('Location eligibility before account adapters are loaded', () => {
  it('loads the HTTP account adapter on demand and forwards coordinates', async () => {
    const coordinates = { latitude: 47.5, longitude: 19 };
    const result = { eligible: true };
    const checkLocationEligibility = vi.fn().mockResolvedValue(result);
    const get = vi.fn().mockResolvedValue({ checkLocationEligibility });
    const service = Object.assign(Object.create(UsersService.prototype), {
      isLocalRouteEnabled: () => false, transportAdapters: { get }
    }) as UsersService;
    expect(await service.checkLocationEligibility(coordinates)).toBe(result);
    expect(get).toHaveBeenCalledExactlyOnceWith(HTTP_ADAPTER.USERS);
    expect(checkLocationEligibility).toHaveBeenCalledExactlyOnceWith(coordinates);
  });

  it('keeps local eligibility on the local adapter without loading HTTP code', async () => {
    const result = { eligible: false };
    const checkLocationEligibility = vi.fn().mockResolvedValue(result);
    const get = vi.fn();
    const service = Object.assign(Object.create(UsersService.prototype), {
      isLocalRouteEnabled: () => true, transportAdapters: { get },
      local: { checkLocationEligibility }
    }) as UsersService;
    expect(await service.checkLocationEligibility()).toBe(result);
    expect(get).not.toHaveBeenCalled();
    expect(checkLocationEligibility).toHaveBeenCalledExactlyOnceWith(undefined);
  });
});
