import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree, type ActivatedRouteSnapshot, type CanActivateFn, type RouterStateSnapshot } from '@angular/router';
import { routes } from './app.routes';
import { SessionService } from './shared/core/base/services/accounts/session.service';
import { UsersService } from './shared/core/base/services/accounts/users.service';
import { PrivacyPolicyService } from './shared/core/base/services/help/privacy-policy.service';
import { SeedDemoBootstrapService } from './shared/core/local/seed/services/platform/demo-bootstrap.service';

const authorizationRoute = routes.find(route => route.path === 'mcp/authorize')!;
const guard = authorizationRoute.canActivate![0] as CanActivateFn;
const requestUrl = '/mcp/authorize?state=return%20%26%20profile&client_id=fixture';

describe('MCP authorization refusal routes', () => {
  const ensureSession = vi.fn();
  const loadUserById = vi.fn();
  const prepareOpen = vi.fn();
  const loadConsent = vi.fn();
  const ensureDemoSelectorReady = vi.fn();

  function configure(localModeEnabled: boolean) {
    TestBed.configureTestingModule({ providers: [
      provideRouter([]),
      { provide: SessionService, useValue: { ensureSession } },
      { provide: UsersService, useValue: {
        localModeEnabled, peekCurrentUser: () => null, loadUserById
      } },
      { provide: PrivacyPolicyService, useValue: { prepareOpen, loadConsent } },
      { provide: SeedDemoBootstrapService, useValue: { ensureDemoSelectorReady } }
    ] });
  }

  async function activate() {
    return TestBed.runInInjectionContext(() => guard(
      { routeConfig: authorizationRoute, data: authorizationRoute.data } as ActivatedRouteSnapshot,
      { url: requestUrl } as RouterStateSnapshot
    ));
  }

  beforeEach(() => {
    vi.resetAllMocks();
    ensureSession.mockResolvedValue({ kind: 'demo', userId: 'fixture-user' });
    ensureDemoSelectorReady.mockResolvedValue(undefined);
  });
  afterEach(() => TestBed.resetTestingModule());

  it.each(['blocked', 'inactive', 'deleted', 'onboarding'])('keeps a local %s profile gated with its return URL', async profileStatus => {
    configure(true);
    loadUserById.mockResolvedValue({ id: 'fixture-user', profileStatus });
    const result = await activate();
    expect(result).toBeInstanceOf(UrlTree);
    const denied = result as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(denied).split('?')[0]).toBe('/entry');
    expect(denied.queryParams['redirect']).toBe(requestUrl);
    expect(ensureDemoSelectorReady).toHaveBeenCalledExactlyOnceWith('union');
    expect(loadConsent).not.toHaveBeenCalled();
  });

  it.each([true, false])('applies the same consent gate to authenticated operator accounts (local=%s)', async localMode => {
    configure(localMode);
    ensureSession.mockResolvedValue({ kind: 'authenticated', profile: { id: 'operator' } });
    loadUserById.mockResolvedValue({ id: 'operator', profileStatus: 'active', operator: true });
    const result = await activate();
    if (localMode) expect(result).toBe(true);
    else { expect(result).toBeInstanceOf(UrlTree); expect(TestBed.inject(Router).serializeUrl(result as UrlTree).split('?')[0]).toBe('/entry'); }
    expect(loadUserById).toHaveBeenCalled();
    expect(prepareOpen).toHaveBeenCalledTimes(localMode ? 0 : 1);
    expect(loadConsent).not.toHaveBeenCalled();
  });
});
