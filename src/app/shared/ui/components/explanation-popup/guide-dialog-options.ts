import type { TourDialogOptions } from '@fssrepository/myscoutee-components';

/** Preserve this application's surface ownership and launcher behavior. */
export function myScouteeTourDialogOptions(): TourDialogOptions {
  return {
    ignoreClickSelector: '.floating-launcher-rail',

    resolveSurface: (contextKey, isRendered) => {
      if (contextKey === 'landing.guide') {
        return document.querySelector<HTMLElement>('app-explanation-launcher [data-guide-surface="landing.guide"]');
      }
      const popups = Array.from(document.querySelectorAll<HTMLElement>('.ui-popup'))
        .filter(popup => isRendered(popup))
        .sort((left, right) => Number(getComputedStyle(left).zIndex) - Number(getComputedStyle(right).zIndex));
      const context = contextKey;
      if (context?.startsWith('landing.')) {
        const surface = document.querySelector<HTMLElement>(`[data-guide-surface="${context}"]`);
        const topPopup = popups[popups.length - 1];
        if (surface && isRendered(surface) && (!topPopup || topPopup.contains(surface))) {
          return topPopup ?? surface;
        }
      }
      return popups[popups.length - 1]
        ?? document.querySelector<HTMLElement>('.user-menu-panel.open[data-guide-surface]')
        ?? document.querySelector<HTMLElement>('[data-guide-surface]');
    }
  };
}
