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


describe('Profile save reuses the approved Login coordinates without GPS', () => {
  afterEach(() => vi.unstubAllGlobals());

  function fixture() {
    let identity = 'login';
    const point = { latitude: 47, longitude: 19 };
    const session = { identity: () => identity,
      currentSession: () => ({ kind: 'authenticated', profile: { id: 'firebase-account' } }) };
    const native = vi.fn(() => new Promise(() => {}));
    vi.stubGlobal('navigator', { permissions: { query: native }, geolocation: { getCurrentPosition: native, watchPosition: native } });
    const pendingLoginCoordinates = vi.fn().mockResolvedValue(point);
    const savedProfiles = { getUserProfile: () => null, setProfileExt: vi.fn(), setUserProfile: vi.fn(), emitProfileSaved: vi.fn() };
    const adapter = { saveUserProfileExt: vi.fn(async request => request.profile), saveUserProfile: vi.fn(async user => user) };
    const service = Object.assign(Object.create(UsersService.prototype), {
      session, sessionService: session, location: { pendingLoginCoordinates },
      userProfileStore: savedProfiles, profiles: savedProfiles, setLoadStatus: vi.fn(), runtime: { setStatus: vi.fn() },
      affiliateReferral: { pending: () => null, clear: vi.fn() }, isTimeoutError: () => false
    });
    Object.defineProperty(service, 'userService', { value: adapter });
    const user = { id: 'new-profile', profileStatus: 'public' };
    return { service, session, point, native, user, adapter, pendingLoginCoordinates,
      switchAccount: () => { identity = 'different-login'; } };
  }

  it('sends the checked coordinates in the profile request without waiting for native APIs', async () => {
    const f = fixture(), user = f.user;
    const saved = await f.service.saveUserProfile(user);
    expect(saved.locationCoordinates).toEqual(f.point);
    expect(f.pendingLoginCoordinates).toHaveBeenCalledExactlyOnceWith('firebase-account');
    expect(f.native).not.toHaveBeenCalled();
    expect(user).not.toHaveProperty('locationCoordinates');
  });

  it('preserves the existing profile coordinates', async () => {
    const f = fixture(), user = { ...f.user, locationCoordinates: { latitude: 48, longitude: 20 } };
    const saved = await f.service.saveUserProfile(user);
    expect(saved.locationCoordinates).toEqual(user.locationCoordinates);
    expect(f.pendingLoginCoordinates).not.toHaveBeenCalled();
    expect(f.native).not.toHaveBeenCalled();
  });

  it('does not request GPS when no pending coordinates exist', async () => {
    const f = fixture(), user = f.user;
    f.pendingLoginCoordinates.mockResolvedValue(null);
    const saved = await f.service.saveUserProfile(user);
    expect(saved).not.toHaveProperty('locationCoordinates');
    expect(f.native).not.toHaveBeenCalled();
  });

  it('does not send an old registration through a replacement session', async () => {
    const f = fixture(), user = f.user;
    f.pendingLoginCoordinates.mockImplementation(async () => { f.switchAccount(); return f.point; });
    expect(await f.service.saveUserProfile(user)).toBeNull();
    expect(f.adapter.saveUserProfileExt).not.toHaveBeenCalled();
    expect(f.adapter.saveUserProfile).not.toHaveBeenCalled();
  });
});
