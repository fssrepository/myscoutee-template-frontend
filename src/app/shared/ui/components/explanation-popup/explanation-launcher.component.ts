import { DialogComponent, type DialogViewConfig } from '@fssrepository/myscoutee-components';
import { myScouteeTourDialogOptions } from './guide-dialog-options';
import { ExplanationGuideService } from '../../../core/base/services/help/explanation-guide.service';
import { Component, DestroyRef, ElementRef, Input, afterEveryRender, computed, inject, signal, untracked, ChangeDetectionStrategy } from '@angular/core';
import {
  FloatingLauncherComponent,
  IndicatorComponent,
  type IndicatorTone,
  I18nPipe,
  PopupPresenceStore,
  type AppMenuDragPosition,
  type AppMenuTrigger
} from '@fssrepository/myscoutee-components';

@Component({ selector: 'app-explanation-launcher', standalone: true,
  imports: [FloatingLauncherComponent, DialogComponent, IndicatorComponent, I18nPipe],
  template: `
    @if (guide.popupOpen() && guide.loading()) {
      <div class="explanation-guide-loading" role="status" aria-busy="true"
        [style.z-index]="layer() - 1" [attr.aria-label]="'loading.explanation.content' | i18n">
        <app-indicator kind="load-ring" state="loading" [tone]="loadingTone"></app-indicator>
      </div>
    }
    @if (guide.launcherVisible()) {
      <div class="floating-launcher-rail" data-guide-surface="landing.guide" [class.is-embedded]="embedded" [style.z-index]="layer()">
        <app-floating-launcher class="explanation-guide-menu" data-guide-field="guide-launcher" [style.visibility]="guide.popupOpen() ? 'visible' : null" [trigger]="trigger()" [position]="position()" [layer]="layer()"
          (positionChange)="position.set($event)" (dismissed)="guide.dismissLauncher()"
          (itemSelect)="$event.sourceEvent.stopPropagation(); guide.openCurrent()"></app-floating-launcher>
      </div>
    }
    @if (guide.popupOpen() && !guide.loading()) {
      <app-dialog [useStore]="false" [dialog]="contentDialog()"></app-dialog>
    }`,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`.explanation-guide-loading { position: fixed; inset: 0; display: grid; place-items: center;
    background: rgba(10, 18, 37, 0.73); }
    .floating-launcher-rail { position: fixed; right: 1.4rem;
    bottom: calc(2.75rem + env(safe-area-inset-bottom, 0px)); pointer-events: none; }
    .floating-launcher-rail.is-embedded { position: relative; right: auto; bottom: auto; }
    @media (max-width: 720px) { .floating-launcher-rail { right: .8rem; } }`]
})
export class ExplanationLauncherComponent {
  @Input() embedded = false;
  @Input() introduce = false;
  @Input() loadingTone: IndicatorTone = 'bright';
  protected readonly guide = inject(ExplanationGuideService);
  private readonly popups = inject(PopupPresenceStore);
  protected readonly position = signal<AppMenuDragPosition>({ x: 0, y: 0 });
  private readonly tourOptions = myScouteeTourDialogOptions();
  private readonly tourActions = {
    close: () => this.guide.closePopup(), empty: () => this.guide.showNoGuide(),
    visibleChange: (visible: boolean) => this.guide.setTourVisible(visible),
    stepChange: (index: number) => this.guide.setStepIndex(index)
  };
  protected readonly contentDialog = computed<DialogViewConfig>(() => this.guide.popupMode() === 'tour'
    ? { mode: 'tour', model: this.guide.dialogModel(), options: this.tourOptions, actions: this.tourActions }
    : { mode: 'explanation', model: this.guide.explanationModel(), actions: { close: this.tourActions.close } });
  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterEveryRender({ read: () => {
      // Once offered (or skipped for a returning visitor), stop measuring the
      // launcher on subsequent renders. Eligibility belongs to the guide.
      if (!this.introduce || !this.guide.canOfferLauncherIntroduction()) return;
      const button = host.querySelector<HTMLElement>('.explanation-guide-menu button');
      if (button?.getClientRects().length && getComputedStyle(button).visibility !== 'hidden') {
        untracked(() => this.guide.offerLauncherIntroduction());
      }
    } });
    inject(DestroyRef).onDestroy(() => {
      if (this.guide.currentContextKey() === 'landing.guide') this.guide.closePopup();
    });
  }
  protected readonly layer = computed(() => Math.max(24060, this.popups.topLayer() + 2));
  // Opening/loading/positioning are already guide mode; keep its launcher stable.
  protected readonly trigger = computed<AppMenuTrigger>(() => ({
    id: 'explanation-guide', icon: 'tips_and_updates',
    palette: this.guide.popupOpen() ? 'brand' : 'neutral-strong', action: 'custom',
    hideLabel: true, ariaLabel: 'explanations'
  }));
}
