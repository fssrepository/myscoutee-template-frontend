import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppSetupStore } from '../../context/stores/app/app-setup.store';
import { PopupPresenceStore, DialogStore } from '@fssrepository/myscoutee-components';
import { I18nService } from '../../../core/base/services/localization/i18n.service';
import { AppSetupPopupComponent } from './app-setup-popup.component';
import { SessionService } from '../../../core/base/services/accounts/session.service';

describe('Setup permission help', () => {
  beforeEach(() => vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()})));
  afterEach(() => { TestBed.resetTestingModule(); vi.unstubAllGlobals(); });

  it('opens above the unchanged setup and closes only the help without requesting permissions', () => {
    const allow = vi.fn(), close = vi.fn();
    const store = {
      isOpen: signal(true), loginRequested: signal(false), actionPending: signal(false), busy: signal(false),
      notificationConfigurationPending: signal(false), locationPermissionPending: signal(false), locationMissing: signal(false),
      locationPermission: signal('denied'), locationAvailable: signal(false), locationSelected: signal(false), locationGranted: signal(false),
      notificationsSelected: signal(false), saveSucceeded: signal(false), error: signal(''), allowDisabled: signal(false),
      allow, close,
      pwa: { openInBrowser: vi.fn(), installPromptVisible: signal(false), installAvailable: signal(false), installActionPending: signal(false) },
      messaging: { notificationPermission: signal('denied'), notificationsConfigured: true }
    };
    TestBed.configureTestingModule({ imports: [AppSetupPopupComponent], providers: [
      { provide: AppSetupStore, useValue: store },
      { provide: SessionService, useValue: { currentSession: () => null } },
      { provide: I18nService, useValue: { revision: () => 0, currentLanguage: () => 'en', translate: (value: string) => value } }
    ] });
    const fixture = TestBed.createComponent(AppSetupPopupComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.permissionActions()[0].label).toBe('app.setup.update');
    store.loginRequested.set(true);
    fixture.detectChanges();
    expect(fixture.componentInstance.permissionActions()[0].label).toBe('login');
    store.loginRequested.set(false);
    const root = fixture.nativeElement as HTMLElement;
    store.loginRequested.set(true);
    store.locationPermission.set('granted');
    store.locationSelected.set(false);
    fixture.detectChanges();
    const notice = root.querySelector('.ui-popup__error');
    expect(notice?.getAttribute('role')).toBe('alert');
    expect(notice?.textContent).toContain('entry.permissions.location.required');
    expect(fixture.componentInstance.toggles()[0].checked).toBe(false);
    expect(fixture.componentInstance.toggles()[0].togglePalette).toBe('slate');
    store.error.set('Region is unavailable');
    fixture.detectChanges();
    expect(root.querySelector('.ui-popup__error')?.textContent).toContain('Region is unavailable');
    store.error.set('');
    store.loginRequested.set(false);
    fixture.detectChanges();
    expect(root.querySelector('.ui-popup__error')?.textContent).toContain('entry.permissions.location.required');
    store.locationSelected.set(true);
    fixture.detectChanges();
    expect(root.querySelector('.ui-popup__error')).toBeNull();

    const setup = root.querySelector('.ui-popup')!;
    const browser = root.querySelector<HTMLElement>('[aria-labelledby="setup-browser"]')!;
    expect(browser.textContent).toContain('app.setup.open.browser.help');
    browser.querySelector<HTMLButtonElement>('button')!.click();
    expect(store.pwa.openInBrowser).toHaveBeenCalledOnce();
    const presence = TestBed.inject(PopupPresenceStore);
    const initialLayer = presence.topLayer();
    const help = root.querySelector<HTMLButtonElement>('button[aria-label="app.setup.help.title"]')!;
    expect(help.nextElementSibling?.classList.contains('ui-popup__close')).toBe(true);
    help.click();
    fixture.detectChanges();
    expect(root.querySelectorAll('.ui-popup')).toHaveLength(2);
    expect(root.querySelector('.ui-popup')).toBe(setup);
    expect(presence.topLayer()).toBeGreaterThan(initialLayer);
    expect(root.querySelectorAll('.app-setup-help-card')).toHaveLength(6);
    root.querySelectorAll<HTMLButtonElement>('.ui-popup__close')[1].click();
    fixture.detectChanges();
    expect(root.querySelectorAll('.ui-popup')).toHaveLength(1);
    expect(presence.topLayer()).toBe(initialLayer);
    expect(store.isOpen()).toBe(true);
    expect(close).not.toHaveBeenCalled();
    expect(allow).not.toHaveBeenCalled();
  });
});

describe('Setup automatic installation offer', () => {
  afterEach(() => TestBed.resetTestingModule());

  function setup(session: unknown) {
    const currentSession = signal(session);
    const store = {
      isOpen: signal(false),
      open: vi.fn(),
      pwa: { installPromptVisible: signal(false) }
    };
    TestBed.configureTestingModule({ providers: [
      { provide: AppSetupStore, useValue: store },
      { provide: SessionService, useValue: { currentSession } },
      { provide: DialogStore, useValue: { dialog: signal(null) } },
      { provide: PopupPresenceStore, useValue: { visible: signal(false) } },
      { provide: I18nService, useValue: { revision: () => 0 } }
    ] });
    TestBed.runInInjectionContext(() => new AppSetupPopupComponent());
    TestBed.tick();
    return { store, currentSession };
  }

  it.each(['demo', 'authenticated'])('does not open automatically for a %s session before or after profile loading', kind => {
    const { store } = setup({ kind });
    store.pwa.installPromptVisible.set(true);
    TestBed.tick();
    expect(store.open).not.toHaveBeenCalled();
    // A caller may still explicitly open Settings or an entry permission gate.
    store.isOpen.set(true);
    TestBed.tick();
    expect(store.isOpen()).toBe(true);
    expect(store.open).not.toHaveBeenCalled();
  });

  it('does not open permission setup for a signed-out installable browser', () => {
    const { store } = setup(null);
    store.pwa.installPromptVisible.set(true);
    TestBed.tick();
    expect(store.open).not.toHaveBeenCalled();
  });
});
