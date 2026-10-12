import { Component, EventEmitter, Output, signal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NavigationCancel, NavigationCancellationCode, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { App } from './app';
import { DEFAULT_DEPLOYMENT_BRANDING } from './shared/core/contracts/platform/deployment-configuration.interface';
import { HomeHeaderComponent } from './home/components/home-header/home-header.component';
import { AppMenuComponent } from '@fssrepository/myscoutee-components';
import { SessionService } from './shared/core/base/services/accounts/session.service';
import { OfflineCacheService } from './shared/core/base/services/platform/offline-cache.service';
import { PwaService } from './shared/core/base/services/platform/pwa.service';
import { I18nService } from './shared/core/base/services/localization/i18n.service';
import { AppLocationService } from './shared/core/base/services/accounts/app-location.service';
import { DeploymentConfigurationService } from './shared/core/base/services/platform/deployment-configuration.service';

@Component({ selector: 'router-outlet', template: '' })
class TestOutlet { @Output() activate = new EventEmitter<void>(); }
@Component({ selector: 'app-setup-popup', template: '' })
class TestSetup {}
@Component({ selector: 'app-payment-authorization-popup', template: '' })
class TestPayment {}
@Component({ selector: 'app-dialog', template: '' })
class TestDialog {}

describe('application startup loading handoff', () => {
  let events: Subject<unknown>;
  let router: { events: Subject<unknown>; url: string; navigated: boolean; getCurrentNavigation: ReturnType<typeof vi.fn> };
  const originalUrl = window.location.href;
  const currentSession = vi.fn();
  const readUser = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    currentSession.mockReset().mockReturnValue(null);
    readUser.mockReset().mockReturnValue(null);
    events = new Subject();
    router = { events, url: '/', navigated: false, getCurrentNavigation: vi.fn().mockReturnValue({ id: 1 }) };
    // Keep the real shell/template while isolating unrelated lazy menu and popup trees.
    TestBed.configureTestingModule({ imports: [App], providers: [
      { provide: Router, useValue: router },
      { provide: PwaService, useValue: { initialize: vi.fn() } },
      { provide: I18nService, useValue: { initialize: vi.fn(), revision: signal(0), translate: (text: string) => text } },
      { provide: SessionService, useValue: { currentSession } },
      { provide: OfflineCacheService, useValue: { readUser } },
      { provide: AppLocationService, useValue: { initialize: vi.fn() } },
      { provide: DeploymentConfigurationService, useValue: {
        initialize: vi.fn(), branding: signal({ productName: 'MyScoutee', logoUrl: '' })
      } }
    ] }).overrideComponent(App, { set: { imports: [NgComponentOutlet, TestOutlet, TestSetup, TestPayment, HomeHeaderComponent, AppMenuComponent, TestDialog] } });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    events.complete();
    vi.restoreAllMocks();
    vi.useRealTimers();
    window.history.replaceState(null, '', originalUrl);
  });

  function create(url = '/') {
    window.history.replaceState(null, '', url);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the default logo and releases the page before branding finishes', () => {
    const loading = signal(true);
    const initialize = vi.fn(() => new Promise<void>(() => {}));
    TestBed.overrideProvider(DeploymentConfigurationService, { useValue: {
      initialize, loading, branding: signal({ ...DEFAULT_DEPLOYMENT_BRANDING })
    } });
    const fixture = create();
    expect(initialize).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.querySelector('.app-route-warmup img').getAttribute('src'))
      .toBe('assets/logo/heart.webp');
    expect(fixture.nativeElement.querySelector('.app-route-warmup__label').textContent)
      .toBe('MyScoutee');
    fixture.debugElement.query(By.directive(TestOutlet)).componentInstance.activate.emit();
    fixture.detectChanges();
    expect(loading()).toBe(true);
    expect(fixture.nativeElement.querySelector('.app-route-warmup')).toBeNull();
  });

  it('uses configured branding when ready and respects an intentionally empty logo', () => {
    const loading = signal(true);
    const branding = signal({ productName: DEFAULT_DEPLOYMENT_BRANDING.productName, logoUrl: DEFAULT_DEPLOYMENT_BRANDING.logoUrl });
    TestBed.overrideProvider(DeploymentConfigurationService, { useValue: {
      initialize: vi.fn(), loading, branding
    } });
    const fixture = create();
    branding.set({ productName: 'Configured name', logoUrl: 'assets/configured-logo.png' });
    loading.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.app-route-warmup img').getAttribute('src'))
      .toBe('assets/configured-logo.png');
    expect(fixture.nativeElement.querySelector('.app-route-warmup__label').textContent)
      .toBe('Configured name');
    branding.set({ productName: 'Configured name', logoUrl: '' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.app-route-warmup img')).toBeNull();
  });

});
