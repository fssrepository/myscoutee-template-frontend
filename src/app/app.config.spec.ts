import { HttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { TestBed } from '@angular/core/testing';
import { environment } from '../environments/environment';
import { ROUTE_CONFIG } from './shared/core/base/config';
import { ADAPTER_MODE_LOADERS } from './shared/core/base/adapter-loaders';
import { loadAppConfig, appConfig, initializeApplication } from './app.config';
import { I18nService } from './shared/core/base/services/localization/i18n.service';
import { SessionService } from './shared/core/base/services/accounts/session.service';
import { DeploymentConfigurationService } from './shared/core/base/services/platform/deployment-configuration.service';

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

describe('Public application bootstrap', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('provides the HTTP client required by entry-page startup services', () => {
    TestBed.configureTestingModule({ providers: appConfig.providers });
    expect(TestBed.inject(HttpClient)).toBeInstanceOf(HttpClient);
  });

  it('loads the actual entry page through its public route', async () => {
    const entry = routes.find(route => route.path === 'entry');
    expect(entry?.loadComponent).toBeTypeOf('function');
    const component = await (entry!.loadComponent!() as Promise<unknown>);
    expect((component as { ɵcmp: { selectors: string[][] } }).ɵcmp.selectors)
      .toContainEqual(['app-entry-page']);
  });
});

describe('template startup requests', () => {
  let finishTranslations: () => void;
  const initializeConfiguration = vi.fn();

  beforeEach(() => {
    initializeConfiguration.mockReset().mockReturnValue(new Promise(() => {}));
    TestBed.configureTestingModule({ providers: [
      { provide: I18nService, useValue: {
        initialize: () => new Promise<void>(resolve => finishTranslations = resolve)
      } },
      { provide: SessionService, useValue: { ensureSession: () => Promise.resolve(null) } },
      { provide: DeploymentConfigurationService, useValue: { initialize: initializeConfiguration } }
    ] });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('starts deployment configuration before translations finish without blocking startup on it', async () => {
    const startup = TestBed.runInInjectionContext(initializeApplication);
    expect(initializeConfiguration).toHaveBeenCalledTimes(1);
    finishTranslations();
    await startup;
  });

  it('keeps deployment initialization errors from rejecting translated startup', async () => {
    initializeConfiguration.mockRejectedValueOnce(new Error('invalid branding'));
    const startup = TestBed.runInInjectionContext(initializeApplication);
    finishTranslations();
    await expect(startup).resolves.toBeUndefined();
  });
});
