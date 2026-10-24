import { ExplanationGuideService } from './explanation-guide.service';
import { InjectionToken, inject } from '@angular/core';

import { myScouteeGuideOptions } from '../../../../ui/components/explanation-popup/guide-options';
import { HelpCenterService } from './help-center.service';
export const LANDING_EXPLANATION_GUIDE = new InjectionToken<ExplanationGuideService>('Landing explanation guide', {
 providedIn: 'root', factory: () => {
  const help = inject(HelpCenterService);
  return new ExplanationGuideService(myScouteeGuideOptions({ dismissalScope: 'visit', loadState: (context, language) => help.loadExplanationState(context, language) }));
 }
});
