import { signal } from '@angular/core';
import { EntryPageComponent } from './entry-page.component';
import { APP_STORAGE_KEYS } from '../../shared/core/common/storage-scope';
import { DemoBootstrapSelectorStore } from '../../shared/ui/context/stores/app/demo-bootstrap-selector.store';

function entry(localMode: boolean, pendingEntry: 'operator' | 'login' | 'explore') {
  return Object.assign(Object.create(EntryPageComponent.prototype), {
    localMode, pendingEntry, authOpen: signal(false),
    session: { authMode: 'selector', setFirebaseRuntimeAvailable: vi.fn() },
    firebase: { ensureFirebaseRuntime: vi.fn() },
    selector: { openDemoBootstrapSelector: vi.fn() }
  });
}

describe('Entry operator access parity', () => {
  it.each([true, false])('keeps the OAuth destination after operator selection (local=%s)', async localMode => {
    const redirect = '/mcp/authorize?client_id=client&state=return%20%26%20role';
    const session = { kind: 'demo', userId: 'operator' };
    const user = { id: 'operator', operator: true, profileStatus: 'public' };
    const component = Object.assign(entry(localMode, 'explore'), {
      session: {
        currentSession: () => session,
        startDemoSession: vi.fn(() => session),
        startTrackedDemoSession: vi.fn().mockResolvedValue(session)
      },
      users: {
        peekCachedUserById: vi.fn(() => user),
        loadUserById: vi.fn().mockResolvedValue(user)
      },
      privacy: {
        activeRevision: () => ({ id: 'privacy', version: 1 }),
        loadConsent: vi.fn().mockResolvedValue({ revisionId: 'privacy', revisionVersion: 1 })
      },
      route: { snapshot: { queryParamMap: new Map([['redirect', redirect]]) } },
      router: { navigateByUrl: vi.fn().mockResolvedValue(true) },
      error: signal('')
    });
    await component.continueEntry();
    const request = component.selector.openDemoBootstrapSelector.mock.calls[0][0];
    expect(await request.onSelect('operator', 'operator')).toBe(true);
    expect(component.privacy.loadConsent).toHaveBeenCalledWith('operator', 'privacy', 1);
    expect(component.router.navigateByUrl).toHaveBeenCalledExactlyOnceWith(redirect);
  });
  it('opens installed operator authentication before Firebase is configured', async () => {
    const component = entry(false, 'operator');
    await component.continueEntry();
    expect(component.authOpen()).toBe(true);
    expect(component.selector.openDemoBootstrapSelector).not.toHaveBeenCalled();
  });
  it('limits frontend-local operator access to the existing operator selector', async () => {
    const component = entry(true, 'operator');
    await component.continueEntry();
    expect(component.authOpen()).toBe(false);
    expect(component.selector.openDemoBootstrapSelector).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'operator', selectableModes: ['operator']
    }));
  });
  it.each(['login', 'explore'] as const)('preserves the unconfigured %s selector', async mode => {
    const component = entry(false, mode);
    await component.continueEntry();
    expect(component.authOpen()).toBe(false);
    expect(component.selector.openDemoBootstrapSelector).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'member', selectableModes: ['member', 'admin', 'operator']
    }));
  });
});

describe('demo selector handoff to the destination', () => {
  it.each([true, false])('lets the selector store close after navigation completes (local=%s)', async localMode => {
    const selector = new DemoBootstrapSelectorStore();
    vi.spyOn(selector, 'ensureDemoBootstrapSelectorLoaded').mockResolvedValue();
    const close = vi.spyOn(selector, 'closeDemoBootstrapSelector');
    let finishNavigation!: (result: boolean) => void;
    const navigation = new Promise<boolean>(resolve => { finishNavigation = resolve; });
    const session = { kind: 'demo', userId: 'member' };
    const user = { id: 'member', name: 'Member', profileStatus: 'public' };
    const component = Object.assign(entry(localMode, 'explore'), {
      selector,
      session: {
        currentSession: () => session,
        startDemoSession: vi.fn(() => session),
        startTrackedDemoSession: vi.fn().mockResolvedValue(session)
      },
      users: {
        peekCachedUserById: vi.fn(() => user),
        loadUserById: vi.fn().mockResolvedValue(user),
        checkLocationEligibility: vi.fn().mockResolvedValue({ eligible: true })
      },
      privacy: {
        activeRevision: () => ({ id: 'privacy', version: 1 }),
        loadConsent: vi.fn().mockResolvedValue({ revisionId: 'privacy', revisionVersion: 1 })
      },
      route: { snapshot: { queryParamMap: new Map<string, string>() } },
      router: { navigateByUrl: vi.fn(() => navigation) },
      error: signal('')
    });
    await component.continueEntry();
    const request = selector.demoBootstrapSelector()!;
    const pending = request.onSelect('member', 'member');
    await vi.waitFor(() => expect(component.router.navigateByUrl).toHaveBeenCalledWith('/home'));
    expect(close).not.toHaveBeenCalled();
    if (localMode) {
      expect(component.users.loadUserById).not.toHaveBeenCalled();
      expect(component.privacy.loadConsent).not.toHaveBeenCalled();
    }
    expect(selector.demoBootstrapSelector()).toBe(request);
    finishNavigation(true);
    await pending;
    expect(close).toHaveBeenCalledOnce();
    expect(selector.demoBootstrapSelector()).toBeNull();
  });
});

describe('entry popup loading parity', () => {
  const revision = { id: 'privacy', version: 1 };

  function landing(localMode = true) {
    let complete!: () => void;
    let fail!: (error: Error) => void;
    const activeRevision = signal<typeof revision | null>(null);
    const content = new Promise<void>((resolve, reject) => { complete = resolve; fail = reject; });
    const component = Object.assign(entry(localMode, 'explore'), {
      busy: signal(false), error: signal(''), consentOpen: signal(false), privacyLoading: signal(false),
      preparation: null, landingGuide: { beginVisit: vi.fn() },
      privacy: {
        activeRevision, revisionKey: () => 'privacy:v1',
        prepareOpen: vi.fn(() => content.then(() => { activeRevision.set(revision); }))
      },
      // A click must not invoke the demo seed owner before opening its popup.
      injector: { get: vi.fn(() => { throw new Error('Demo seed requested before popup'); }) }
    });
    component.session.currentSession = () => null;
    return { component, complete, fail };
  }

  afterEach(() => localStorage.removeItem(APP_STORAGE_KEYS.entryConsent));

  it.each([true, false])('starts privacy content on landing without blocking controls (local=%s)', async localMode => {
    const { component, complete } = landing(localMode);
    component.ngOnInit();
    expect(component.privacy.prepareOpen).toHaveBeenCalledOnce();
    expect(component.privacyLoading()).toBe(true);
    expect(component.busy()).toBe(false);
    expect(component.consentOpen()).toBe(false);
    expect(component.injector.get).not.toHaveBeenCalled();
    const pending = component.preparation;
    complete();
    await pending;
    expect(component.privacyLoading()).toBe(false);
  });

  it.each(['explore', 'login'] as const)('checks the current consent revision before opening consent on %s', async mode => {
    const { component, complete } = landing();
    component.ngOnInit();
    const pending = component.requestEntry(mode);
    expect(component.consentOpen()).toBe(false);
    expect(component.privacyLoading()).toBe(true);
    expect(component.privacy.prepareOpen).toHaveBeenCalledOnce();
    expect(component.selector.openDemoBootstrapSelector).not.toHaveBeenCalled();
    expect(component.authOpen()).toBe(false);
    expect(component.injector.get).not.toHaveBeenCalled();
    complete();
    await pending;
    expect(component.consentOpen()).toBe(true);
    expect(component.busy()).toBe(false);
    expect(component.privacyLoading()).toBe(false);
    expect(component.selector.openDemoBootstrapSelector).not.toHaveBeenCalled();
  });

  it.each(['explore', 'login'] as const)('opens the existing selector for accepted %s without preparing demo data in the page', async mode => {
    const { component, complete } = landing();
    localStorage.setItem(APP_STORAGE_KEYS.entryConsent, JSON.stringify({
      version: 'privacy:privacy:v1', accepted: true, acceptedAtIso: '2026-10-12T12:00:00Z'
    }));
    component.ngOnInit();
    const opened = vi.spyOn(component.consentOpen, 'set');
    const pending = component.requestEntry(mode);
    expect(component.consentOpen()).toBe(false);
    complete();
    await pending;
    expect(opened).not.toHaveBeenCalledWith(true);
    expect(component.consentOpen()).toBe(false);
    expect(component.selector.openDemoBootstrapSelector).toHaveBeenCalledOnce();
    expect(component.injector.get).not.toHaveBeenCalled();
    expect(component.busy()).toBe(false);
  });

  it('reports failed privacy loading without opening consent or allowing entry', async () => {
    const { component, fail } = landing();
    component.ngOnInit();
    const pending = component.requestEntry('login');
    fail(new Error('offline'));
    await pending;
    expect(component.consentOpen()).toBe(false);
    expect(component.error()).toBe('Privacy content is not available right now.');
    expect(component.busy()).toBe(false);
    expect(component.privacyLoading()).toBe(false);
    expect(component.selector.openDemoBootstrapSelector).not.toHaveBeenCalled();
    expect(component.authOpen()).toBe(false);
    component.privacy.prepareOpen.mockResolvedValue(revision);
    component.privacy.activeRevision.set(revision);
    await component.requestEntry('login');
    expect(component.error()).toBe('');
    expect(component.consentOpen()).toBe(true);
  });
});
