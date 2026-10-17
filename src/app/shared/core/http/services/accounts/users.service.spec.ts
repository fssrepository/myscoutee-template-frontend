import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SessionService, type AppSession } from '../../../base/services/accounts/session.service';
import { OfflineCacheService } from '../../../base/services/platform/offline-cache.service';
import { RouteDelayService } from '../../../base/services/platform/route-delay.service';
import type { UserByIdQueryResponse, UserDto } from '../../../contracts/accounts/user.interface';
import { HttpUsersService } from './users.service';

describe('HTTP profile cache within a Firebase session', () => {
  let session: AppSession | null;
  let stored: Map<string, UserByIdQueryResponse>;
  const get = vi.fn();
  const writeUser = vi.fn();
  const user = { id: 'server-profile-id', name: 'Real server profile' } as UserDto;

  beforeEach(() => {
    session = { kind: 'firebase', sessionId: 'current-session', profile: {
      id: 'firebase-uid', name: 'Firebase name', email: 'user@example.test', initials: 'F'
    } };
    stored = new Map();
    get.mockReset();
    writeUser.mockReset().mockImplementation((key, value) => stored.set(key, value));
    TestBed.configureTestingModule({ providers: [
      HttpUsersService,
      { provide: HttpClient, useValue: { get } },
      { provide: SessionService, useValue: { currentSession: () => session } },
      { provide: RouteDelayService, useValue: { withRequestTimeout: (_route: string, task: Promise<unknown>) => task } },
      { provide: OfflineCacheService, useValue: { readUser: (key: string) => stored.get(key) ?? null, writeUser } }
    ] });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('restores the real server profile offline under its owning Firebase identity', async () => {
    get.mockReturnValueOnce(of(user)).mockReturnValueOnce(throwError(() => ({ status: 0 })));
    const service = TestBed.inject(HttpUsersService);
    await service.queryUserById();
    expect((await service.queryUserById()).user).toEqual(user);
    expect(service.peekCachedUserById('firebase-uid')).toEqual(user);
    expect(stored.has('server-profile-id')).toBe(false);
  });

  it.each([502, 503, 504])('retains the cached profile during gateway failure %s', async status => {
    stored.set('firebase-uid', { user });
    get.mockReturnValue(throwError(() => ({ status })));
    expect((await TestBed.inject(HttpUsersService).queryUserById()).user).toEqual(user);
  });

  it.each([401, 403])('does not mask revoked authority %s with a cached profile', async status => {
    stored.set('firebase-uid', { user });
    const error = { status };
    get.mockReturnValue(throwError(() => error));
    await expect(TestBed.inject(HttpUsersService).queryUserById()).rejects.toBe(error);
  });

  it('keeps demo profiles server-authoritative on request failure', async () => {
    session = { kind: 'demo', userId: 'firebase-uid' };
    stored.set('firebase-uid', { user });
    const error = { status: 0 };
    get.mockReturnValue(throwError(() => error));
    await expect(TestBed.inject(HttpUsersService).queryUserById()).rejects.toBe(error);
  });
});
