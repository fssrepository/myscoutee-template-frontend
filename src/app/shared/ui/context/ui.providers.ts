import { GUIDE_CONTEXT, DIALOG_TEXT } from '@fssrepository/myscoutee-components';
import { ExplanationGuideService } from '../../core/base/services/help/explanation-guide.service';
import { EXPLANATION_GUIDE_OPTIONS } from '../../core/base/services/help/explanation-guide.service';
import { inject, provideEnvironmentInitializer } from '@angular/core';
import { OverlayNavigationStore, provideUiTranslations, UI_BRANDING, UI_IMAGE_UPLOAD, UI_IMAGE_URLS } from '@fssrepository/myscoutee-components';
import { MediaService } from '../../core/base/services/media/media.service';
import { MYSCOUTEE_IMAGE_URLS } from '../../core/common/image-urls';
import { I18nService } from '../../core/base/services/localization/i18n.service';
import { DeploymentConfigurationService } from '../../core/base/services/platform/deployment-configuration.service';
import { HelpCenterService } from '../../core/base/services/help/help-center.service';
import { APP_STORAGE_KEYS } from '../../core/common/storage-scope';
import { myScouteeGuideOptions } from '../components/explanation-popup/guide-options';
export const SHARED_UI_PROVIDERS=[
  // Register same-route popup history before Router's window popstate listener.
  provideEnvironmentInitializer(() => { inject(OverlayNavigationStore); }),
  provideUiTranslations(I18nService),
  { provide: GUIDE_CONTEXT, useExisting: ExplanationGuideService },
  { provide: DIALOG_TEXT, useFactory: () => {
    const i18n = inject(I18nService);
    return (value: string) => { i18n.revision(); return i18n.translate(value); };
  } },
  { provide: UI_IMAGE_UPLOAD, useExisting: MediaService },
  { provide: UI_IMAGE_URLS, useValue: MYSCOUTEE_IMAGE_URLS },
  { provide: UI_BRANDING,useFactory: (service: DeploymentConfigurationService) => service.branding,deps: [DeploymentConfigurationService] },
  {
    provide: EXPLANATION_GUIDE_OPTIONS,
    useFactory: () => {
      const help = inject(HelpCenterService);
      return myScouteeGuideOptions({
        storageKey: APP_STORAGE_KEYS.explanationGuideEnabled,
        loadState: (context, language) => help.loadExplanationState(context, language)
      });
    }
  }
];
export default SHARED_UI_PROVIDERS;
