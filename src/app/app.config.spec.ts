import { TestBed } from '@angular/core/testing';
import { environment } from '../environments/environment';
import { ROUTE_CONFIG } from './shared/core/base/config';
import { ADAPTER_MODE_LOADERS } from './shared/core/base/adapter-loaders';
import { loadAppConfig, appConfig } from './app.config';

describe('template bootstrap adapter loading', () => {
  const originalMode = environment.activitiesDataSource;
  const originalUrl = location.href;
  const originalEntries = [...ROUTE_CONFIG.entries];
  let base: HTMLBaseElement;
  beforeEach(() => {
    localStorage.clear();
    history.replaceState(null, '', '/');
    base = document.createElement('base');
    base.href = '/';
    document.head.prepend(base);
    environment.activitiesDataSource = 'http';
    vi.spyOn(ADAPTER_MODE_LOADERS, 'local');
    vi.spyOn(ADAPTER_MODE_LOADERS, 'http');
  });
  afterEach(() => {
    environment.activitiesDataSource = originalMode;
    ROUTE_CONFIG.entries = [...originalEntries];
    localStorage.clear();
    history.replaceState(null, '', originalUrl);
    base.remove();
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });
  it('prepares public HTTP entry without the workspace or local side', async () => {
    expect(await loadAppConfig()).toBe(appConfig);
    expect(ADAPTER_MODE_LOADERS.http).not.toHaveBeenCalled();
    expect(ADAPTER_MODE_LOADERS.local).not.toHaveBeenCalled();
  });
  it.each(['demo', 'firebase'])('preserves full preparation for a retained %s session', async kind => {
    localStorage.setItem('myscoutee-template.http.session.v1', JSON.stringify({ kind, userId: 'actor' }));
    await loadAppConfig();
    expect(ADAPTER_MODE_LOADERS.http).toHaveBeenCalledExactlyOnceWith();
    expect(ADAPTER_MODE_LOADERS.local).not.toHaveBeenCalled();
  });
  it('prepares the full HTTP side for direct workspace navigation', async () => {
    history.replaceState(null, '', '/home');
    await loadAppConfig();
    expect(ADAPTER_MODE_LOADERS.http).toHaveBeenCalledExactlyOnceWith();
  });
  it('keeps standalone startup on the local side', async () => {
    environment.activitiesDataSource = 'local';
    await loadAppConfig();
    expect(ADAPTER_MODE_LOADERS.local).toHaveBeenCalledExactlyOnceWith();
    expect(ADAPTER_MODE_LOADERS.http).not.toHaveBeenCalled();
  });
});
