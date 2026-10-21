import { TestBed } from '@angular/core/testing';

import { ADAPTER_LOADERS, cachedAdapterType, HTTP_ADAPTER, LOCAL_ADAPTER } from '../../adapter-loaders';
import { HttpUsersService } from '../../../http/services/accounts/users.service';
import { LocalUsersService } from '../../../local/source/services/accounts/users.service';
import { AdapterProxyService } from './adapter-proxy.service';

describe('AdapterProxyService', () => {
  const local = { loadUserById: vi.fn(), saveProfile: vi.fn() };
  const http = { loadUserById: vi.fn(), saveProfile: vi.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      { provide: LocalUsersService, useValue: local },
      { provide: HttpUsersService, useValue: http }
    ] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('loads neither implementation when the proxy is constructed', () => {
    const localLoader = vi.spyOn(ADAPTER_LOADERS, LOCAL_ADAPTER.USERS);
    const httpLoader = vi.spyOn(ADAPTER_LOADERS, HTTP_ADAPTER.USERS);
    TestBed.inject(AdapterProxyService);
    expect(localLoader).not.toHaveBeenCalled();
    expect(httpLoader).not.toHaveBeenCalled();
  });

  it('shares an in-flight import and keeps the existing Angular singleton', async () => {
    let finish!: (value: typeof LocalUsersService) => void;
    const imported = new Promise<typeof LocalUsersService>(resolve => { finish = resolve; });
    const loader = vi.spyOn(ADAPTER_LOADERS, LOCAL_ADAPTER.USERS).mockReturnValue(imported);
    const unusedLoader = vi.spyOn(ADAPTER_LOADERS, HTTP_ADAPTER.USERS);
    const proxy = TestBed.inject(AdapterProxyService);
    const first = proxy.get(LOCAL_ADAPTER.USERS);
    const second = proxy.get(LOCAL_ADAPTER.USERS);
    expect(first).toBe(second);
    await Promise.resolve();
    expect(loader).toHaveBeenCalledTimes(1);
    finish(LocalUsersService);
    expect(await first).toBe(TestBed.inject(LocalUsersService));
    expect(await proxy.get(LOCAL_ADAPTER.USERS)).toBe(local);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(unusedLoader).not.toHaveBeenCalled();
  });

  it('loads HTTP independently without loading local code', async () => {
    const localLoader = vi.spyOn(ADAPTER_LOADERS, LOCAL_ADAPTER.USERS);
    const httpLoader = vi.spyOn(ADAPTER_LOADERS, HTTP_ADAPTER.USERS)
      .mockResolvedValue(HttpUsersService);
    expect(await TestBed.inject(AdapterProxyService).get(HTTP_ADAPTER.USERS)).toBe(http);
    expect(httpLoader).toHaveBeenCalledTimes(1);
    expect(localLoader).not.toHaveBeenCalled();
  });

  it('propagates a failed import and permits a subsequent caller to retry it', async () => {
    const failure = new Error('chunk unavailable');
    const loader = vi.spyOn(ADAPTER_LOADERS, LOCAL_ADAPTER.USERS)
      .mockRejectedValueOnce(failure).mockResolvedValue(LocalUsersService);
    const proxy = TestBed.inject(AdapterProxyService);
    await expect(proxy.get(LOCAL_ADAPTER.USERS)).rejects.toBe(failure);
    expect(await proxy.get(LOCAL_ADAPTER.USERS)).toBe(local);
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('preserves synchronous reads and method binding while leaving the counterpart unconstructed', async () => {
    const items: unknown[] = [];
    const localInstance = { items, peekCachedUserById() { return this.items; } };
    const localFactory = vi.fn(() => localInstance);
    const httpFactory = vi.fn(() => ({}));
    const localType = cachedAdapterType(LOCAL_ADAPTER.USERS)!;
    const httpType = cachedAdapterType(HTTP_ADAPTER.USERS)!;
    TestBed.configureTestingModule({ providers: [
      { provide: localType, useFactory: localFactory },
      { provide: httpType, useFactory: httpFactory }
    ] });
    const proxy = TestBed.inject(AdapterProxyService);
    const localReference = proxy.reference(LOCAL_ADAPTER.USERS);
    proxy.reference(HTTP_ADAPTER.USERS);
    expect(localFactory).not.toHaveBeenCalled();
    expect(httpFactory).not.toHaveBeenCalled();
    expect(localReference.peekCachedUserById('actor')).toBe(items);
    expect(localReference.peekCachedUserById('actor')).toBe(items);
    expect(await proxy.get(LOCAL_ADAPTER.USERS)).toBe(TestBed.inject(localType));
    expect(localFactory).toHaveBeenCalledTimes(1);
    expect(httpFactory).not.toHaveBeenCalled();
  });
});
