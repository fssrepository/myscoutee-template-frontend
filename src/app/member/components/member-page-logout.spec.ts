import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { MemberPageComponent } from './member-page.component';
import { UsersService, USER_LOGOUT_CONTEXT_KEY } from '../../shared/core/base/services/accounts/users.service';
import { SessionService } from '../../shared/core/base/services/accounts/session.service';
import { HttpUsersService } from '../../shared/core/http/services/accounts/users.service';
import { LocalUsersRepository } from '../../shared/core/local/source/repositories/accounts/users.repository';
import { LocalNotificationsRepository } from '../../shared/core/local/source/repositories/notifications/notifications.repository';
import { LocalCountryPartitionsRepository } from '../../shared/core/local/source/repositories/platform/country-partitions.repository';
import { AppRuntimeStore } from '../../shared/ui/context/stores/app/app-runtime.store';

describe('logout confirmation uses the native user action before clearing the session', () => {
  const originalMode = environment.activitiesDataSource;
  let component: any;
  let httpLogout: ReturnType<typeof vi.fn>;
  let users: UsersService;
  beforeEach(() => {
    vi.useFakeTimers();
    environment.activitiesDataSource = 'local';
    httpLogout = vi.fn().mockResolvedValue({ submitted: true, message: null });
    TestBed.configureTestingModule({ providers: [
      { provide: SessionService, useValue: { identity: () => 'member', currentSession: () => ({ kind: 'demo', userId: 'member' }) } },
      { provide: HttpUsersService, useValue: { logoutUser: httpLogout } },
      { provide: LocalUsersRepository, useValue: {} },
      { provide: LocalNotificationsRepository, useValue: {} },
      { provide: LocalCountryPartitionsRepository, useValue: {} }
    ] });
    users = TestBed.inject(UsersService);
    component = Object.assign(Object.create(MemberPageComponent.prototype), {
      users,
      session: { logout: vi.fn().mockResolvedValue(undefined) },
      profiles: { activeUserId: () => 'member', activeUserProfile: () => ({ name: 'Alex' }), setActiveUserId: vi.fn() },
      dialogs: { open: vi.fn(), openInfo: vi.fn() },
      router: { navigateByUrl: vi.fn().mockResolvedValue(true) }
    });
  });
  afterEach(() => { environment.activitiesDataSource = originalMode; TestBed.resetTestingModule(); vi.useRealTimers(); });

  it.each(['member', 'admin', 'operator'])('keeps the %s confirmation pending for the configured 1500 ms local action', async role => {
    component.role = role;
    await component.selectSetting('logout');
    expect(component.session.logout).not.toHaveBeenCalled();
    const pending = component.dialogs.open.mock.calls[0][0].onConfirm();
    expect(TestBed.inject(AppRuntimeStore).getLoadingState(USER_LOGOUT_CONTEXT_KEY).status).toBe('loading');
    await vi.advanceTimersByTimeAsync(1499);
    expect(component.session.logout).not.toHaveBeenCalled();
    expect(component.router.navigateByUrl).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(component.session.logout).toHaveBeenCalledExactlyOnceWith({ sessionAlreadyRevoked: true });
    expect(component.profiles.setActiveUserId).toHaveBeenCalledWith('');
    expect(component.router.navigateByUrl).toHaveBeenCalledWith('/entry');
    expect(httpLogout).not.toHaveBeenCalled();
  });

  it('uses the HTTP action without adding the local timer', async () => {
    environment.activitiesDataSource = 'http';
    await component.selectSetting('logout');
    await component.dialogs.open.mock.calls[0][0].onConfirm();
    expect(httpLogout).toHaveBeenCalledWith({ userId: 'member' }, expect.any(AbortSignal), undefined);
    expect(component.session.logout).toHaveBeenCalledExactlyOnceWith({ sessionAlreadyRevoked: true });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('retains the session and reports a rejected logout instead of navigating', async () => {
    environment.activitiesDataSource = 'http';
    httpLogout.mockResolvedValue({ submitted: false, message: 'Try again' });
    await component.selectSetting('logout');
    await component.dialogs.open.mock.calls[0][0].onConfirm();
    expect(component.dialogs.openInfo).toHaveBeenCalledWith('Try again', expect.any(Object));
    expect(component.session.logout).not.toHaveBeenCalled();
    expect(component.router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('aborts an in-flight local action through the existing route delay', async () => {
    const abort = new AbortController();
    const pending = users.logoutUser('member', undefined, abort.signal);
    abort.abort();
    expect(await pending).toEqual({ submitted: false, message: null });
    expect(TestBed.inject(AppRuntimeStore).getLoadingState(USER_LOGOUT_CONTEXT_KEY).status).toBe('idle');
    expect(vi.getTimerCount()).toBe(0);
  });
});
