import { OnInit } from '@angular/core';
import {OperatorEmailConfigurationComponent} from '../operator-email-configuration/operator-email-configuration.component';
import type {OperatorTlsCertificateMode} from '../../../shared/core/contracts/operator/operator.interface';
import type {AppMenuTrigger} from '@fssrepository/myscoutee-components';
import {Component,ChangeDetectionStrategy,computed,inject,output,OnDestroy} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {IndicatorComponent,ImageCarouselComponent,FormFlowComponent,type FormFlowModel,LinkInputComponent,type LinkInputConfig,AppMenuComponent,type AppMenuItem,type AppMenuItemSelectEvent,PopupComponent,type PopupModel,I18nPipe} from '@fssrepository/myscoutee-components';
import {I18nService} from '../../../shared/core/base/services/localization/i18n.service';
import type {DeploymentSocialLinkDto} from '../../../shared/core/contracts/platform/deployment-configuration.interface';
import {OperatorWorkspaceStore} from '../../../shared/ui/context/stores/operator/operator-workspace.store';
type OperatorPopupAction="toggle-tls-auto-renew"|"set-tls-mode"|"test-tls-domain"|"test-tls-certificate"|"save-tls"|"save-branding"|"save-admin-emails"|"save-privacy-contact"|"save-social-links"|"add-social-link"|"remove-social-link"|"save-integration"|"register-firebase"|"activate-firebase"|"test-authentication"|"test-messaging";
interface OperatorPopupActionContext {action:OperatorPopupAction;socialLinkIndex?:number;tlsMode?:OperatorTlsCertificateMode;}
@Component({selector:'app-operator-configuration-popup',standalone:true,
 imports:[OperatorEmailConfigurationComponent,FormsModule,MatIconModule,IndicatorComponent,ImageCarouselComponent,FormFlowComponent,LinkInputComponent,AppMenuComponent,PopupComponent,I18nPipe],
 templateUrl:'./operator-configuration-popup.component.html',styleUrl:'./operator-configuration-popup.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class OperatorConfigurationPopupComponent implements OnInit, OnDestroy {
 readonly closed=output<void>();
 ngOnInit():void{this.workspace.clearFeedback();void this.workspace.loadConfiguration();}
 ngOnDestroy():void{this.workspace.clearConfigurationCredentialDrafts();this.workspace.clearFeedback();}
 protected readonly popup = computed<PopupModel>(() => ({
   title: 'operator.action.configuration', subtitle: 'operator.configuration.subtitle',
   ariaLabel: 'operator.action.configuration', closeAriaLabel: 'operator.popup.close',
   size: 'wide', height: 'full', mobilePresentation: 'fullscreen',
   headerTone: 'accent', headerPalette: 'blue', backdropTone: 'dim',
   bodyLayout: 'default', onClose: () => this.closed.emit()
 }));
  protected readonly configurationAdminEmailsFormModel =
    computed<FormFlowModel>(() => {
      this.i18n.revision();
      const translate = (key: string): string => this.i18n.translate(key);
      return {
        title: translate('operator.configuration.admin'),
        layout: 'grouped',
        header: false,
        save: null,
        completion: { controls: 'none' },
        steps: [{
          id: 'operator-configuration-admin-emails',
          title: '',
          chrome: 'none',
          controls: [{
            id: 'operator-configuration-admin-email-list',
            bind: 'adminEmailsText',
            kind: 'textarea',
            layout: 'wide',
            label: translate('operator.configuration.admin.emails'),
            placeholder: translate(
              'operator.configuration.admin.emails.placeholder'
            ),
            rows: 4,
            maxLength: 8192,
            validationError: () =>
              this.workspace.configurationAdminEmailsValidationKey()
          }]
        }]
      };
    });

  protected readonly configurationAdminEmailsFormValue = computed(() => ({
    adminEmailsText: this.workspace.configurationAdminEmailsInput()
  }));

  protected readonly configurationPrivacyContactFormModel =
    computed<FormFlowModel>(() => {
      this.i18n.revision();
      const translate = (key: string): string => this.i18n.translate(key);
      return {
        title: translate('operator.configuration.privacy.contact'),
        layout: 'grouped',
        header: false,
        save: null,
        completion: { controls: 'none' },
        steps: [{
          id: 'operator-configuration-privacy-contact',
          title: '',
          chrome: 'none',
          controls: [
            {
              id: 'operator-configuration-data-controller-name',
              bind: 'dataControllerName',
              kind: 'text',
              layout: 'half',
              label: translate(
                'operator.configuration.privacy.controller.name'
              ),
              placeholder: translate(
                'operator.configuration.privacy.controller.name.placeholder'
              ),
              maxLength: 160,
              validationError: () =>
                this.workspace.configurationPrivacyContactValidationKey()
            },
            {
              id: 'operator-configuration-privacy-contact-email',
              bind: 'privacyContactEmail',
              kind: 'text',
              layout: 'half',
              label: translate(
                'operator.configuration.privacy.contact.email'
              ),
              placeholder: translate(
                'operator.configuration.privacy.contact.email.placeholder'
              ),
              maxLength: 254,
              validationError: () =>
                this.workspace.configurationPrivacyContactValidationKey()
            }
          ]
        }]
      };
    });

  protected readonly configurationPrivacyContactFormValue = computed(() => ({
    dataControllerName:
      this.workspace.configurationDraft()?.privacyContact.dataControllerName
      ?? '',
    privacyContactEmail:
      this.workspace.configurationDraft()?.privacyContact.privacyContactEmail
      ?? ''
  }));

  protected readonly configurationBrandingActionItems = computed<
    readonly AppMenuItem<string, OperatorPopupActionContext>[]
  >(() => {
    const draft = this.workspace.configurationDraft();
    return [{
      id: 'operator-save-branding',
      label: 'operator.configuration.branding.save',
      icon: 'save',
      palette: 'blue',
      layout: 'action',
      disabled: this.configurationDisabled()
        || !draft
        || !this.workspace.configurationBrandingReady(),
      progress: this.busyAction() === 'save-branding'
        ? { state: 'loading', durationMs: 3000 }
        : null,
      context: { action: 'save-branding' }
    }];
  });

  protected readonly configurationAdminEmailActionItems = computed<
    readonly AppMenuItem<string, OperatorPopupActionContext>[]
  >(() => [{
    id: 'operator-save-admin-emails',
    label: 'operator.configuration.admin.save',
    icon: 'save',
    palette: 'orange',
    layout: 'action',
    disabled: this.configurationDisabled()
      || !this.workspace.configurationAdminEmailsReady(),
    progress: this.busyAction() === 'save-admin-emails'
      ? { state: 'loading', durationMs: 3000 }
      : null,
    context: { action: 'save-admin-emails' }
  }]);

  protected readonly configurationPrivacyContactActionItems = computed<
    readonly AppMenuItem<string, OperatorPopupActionContext>[]
  >(() => [{
    id: 'operator-save-privacy-contact',
    label: 'operator.configuration.privacy.contact.save',
    icon: 'save',
    palette: 'blue',
    layout: 'action',
    disabled: this.configurationDisabled()
      || !this.workspace.configurationPrivacyContactReady(),
    progress: this.busyAction() === 'save-privacy-contact'
      ? { state: 'loading', durationMs: 3000 }
      : null,
    context: { action: 'save-privacy-contact' }
  }]);

  protected readonly configurationSocialLinkActionItems = computed<
    readonly AppMenuItem<string, OperatorPopupActionContext>[]
  >(() => {
    const count =
      this.workspace.configurationDraft()?.socialLinks.length ?? 0;
    return [
      {
        id: 'operator-add-social-link',
        label: 'operator.configuration.social.add',
        icon: 'add_link',
        palette: 'teal',
        layout: 'action',
        disabled: this.configurationDisabled() || count >= 12,
        context: { action: 'add-social-link' }
      },
      {
        id: 'operator-save-social-links',
        label: 'operator.configuration.social.save',
        icon: 'save',
        palette: 'green',
        layout: 'action',
        disabled: this.configurationDisabled()
          || !this.workspace.configurationSocialLinksReady(),
        progress: this.busyAction() === 'save-social-links'
          ? { state: 'loading', durationMs: 3000 }
          : null,
        context: { action: 'save-social-links' }
      }
    ];
  });

  protected readonly configurationIntegrationActionItems = computed<
    readonly AppMenuItem<string, OperatorPopupActionContext>[]
  >(() => [{
    id: 'operator-save-integration',
    label: 'operator.configuration.integration.save',
    icon: 'save',
    palette: 'blue',
    layout: 'action',
    disabled: this.configurationDisabled()
      || !this.workspace.configurationIntegrationReady(),
    progress: this.busyAction() === 'save-integration'
      ? { state: 'loading', durationMs: 3000 }
      : null,
    context: { action: 'save-integration' }
  }]);

  protected readonly configurationFirebaseSaveActionItems = computed<
    readonly AppMenuItem<string, OperatorPopupActionContext>[]
  >(() => {
    const draft = this.workspace.configurationDraft();
    const configuration = this.workspace.configuration();
    const locallyTested = Boolean(
      this.workspace.configurationAuthenticationTest()?.success
      && this.workspace.configurationMessagingTest()?.success
    );
    const publicClientReady = Boolean(
      draft?.firebase.apiKey.trim()
      && draft.firebase.authDomain.trim()
      && draft.firebase.projectId.trim()
      && draft.firebase.messagingSenderId.trim()
      && draft.firebase.appId.trim()
      && draft.firebase.vapidKey.trim()
    );
    return [
      {
        id: 'operator-save-firebase',
        label: 'operator.configuration.firebase.save',
        icon: 'save',
        palette: 'orange',
        layout: 'action',
        disabled: this.configurationDisabled()
          || !draft?.firebase.projectId.trim(),
        progress: this.busyAction() === 'register-firebase'
          ? { state: 'loading', durationMs: 3000 }
          : null,
        context: { action: 'register-firebase' }
      },
      {
        id: 'operator-activate-firebase',
        label: configuration?.firebase.active
          ? 'operator.configuration.firebase.active'
          : 'operator.configuration.firebase.activate',
        icon: configuration?.firebase.active
          ? 'verified'
          : 'published_with_changes',
        palette: 'green',
        layout: 'action',
        disabled: this.configurationDisabled()
          || Boolean(configuration?.firebase.active)
          || this.workspace.configurationFirebaseDirty()
          || !publicClientReady
          || !(
            configuration?.firebase.readyToActivate
            || locallyTested
          ),
        progress: this.busyAction() === 'activate-firebase'
          ? { state: 'loading', durationMs: 3000 }
          : null,
        context: { action: 'activate-firebase' }
      }
    ];
  });

  protected readonly configurationFirebaseTestActionItems = computed<
    readonly AppMenuItem<string, OperatorPopupActionContext>[]
  >(() => {
    const configuration = this.workspace.configuration();
    const authenticationFeedback =
      this.workspace.configurationAuthenticationFeedback();
    const messagingFeedback = this.workspace.configurationMessagingFeedback();
    return [
      {
        id: 'operator-test-authentication',
        label: 'operator.configuration.test.authentication.short',
        icon: authenticationFeedback === 'success'
          ? 'check_circle'
          : authenticationFeedback === 'error'
            ? 'error_outline'
            : 'verified_user',
        palette: authenticationFeedback === 'success'
          ? 'green'
          : authenticationFeedback === 'error'
            ? 'red'
            : 'blue',
        layout: 'action',
        disabled: this.configurationDisabled()
          || this.workspace.configurationFirebaseDirty()
          || !configuration?.firebase.authenticationCredentialConfigured
          || authenticationFeedback !== null,
        progress: this.busyAction() === 'test-authentication'
          ? { state: 'loading', durationMs: 3000 }
          : authenticationFeedback
            ? { state: authenticationFeedback, durationMs: 1000 }
            : null,
        context: { action: 'test-authentication' }
      },
      {
        id: 'operator-test-messaging',
        label: 'operator.configuration.test.messaging.short',
        icon: messagingFeedback === 'success'
          ? 'check_circle'
          : messagingFeedback === 'error'
            ? 'error_outline'
            : 'notifications_active',
        palette: messagingFeedback === 'success'
          ? 'green'
          : messagingFeedback === 'error'
            ? 'red'
            : 'orange',
        layout: 'action',
        disabled: this.configurationDisabled()
          || this.workspace.configurationFirebaseDirty()
          || !configuration?.firebase.messagingCredentialConfigured
          || messagingFeedback !== null,
        progress: this.busyAction() === 'test-messaging'
          ? { state: 'loading', durationMs: 3000 }
          : messagingFeedback
            ? { state: messagingFeedback, durationMs: 1000 }
            : null,
        context: { action: 'test-messaging' }
      }
    ];
  });

  protected configurationDisabled(): boolean {
    return this.busy()
      || this.workspace.configuration()?.capability !== 'AVAILABLE';
  }

  protected onBrandingLogoChange(imageUrls: readonly string[]): void {
    this.workspace.setConfigurationBranding({
      logoUrl: imageUrls[0] ?? ''
    });
  }

  protected onBrandingLogoCharacterIndexChange(
    value: number | string | null
  ): void {
    if (value === null || `${value}`.trim() === '') {
      this.workspace.setConfigurationBranding({ logoCharacterIndex: 0 });
      return;
    }
    this.workspace.setConfigurationBranding({
      logoCharacterIndex: Number(value)
    });
  }

  protected onConfigurationAdminEmailsChange(value: unknown): void {
    if (!value || typeof value !== 'object') {
      this.workspace.setConfigurationAdminEmailsInput('');
      return;
    }
    const adminEmailsText = (value as {
      adminEmailsText?: unknown;
    }).adminEmailsText;
    this.workspace.setConfigurationAdminEmailsInput(
      `${adminEmailsText ?? ''}`
    );
  }

  protected onConfigurationPrivacyContactChange(value: unknown): void {
    if (!value || typeof value !== 'object') {
      this.workspace.setConfigurationPrivacyContact({
        dataControllerName: '',
        privacyContactEmail: ''
      });
      return;
    }
    const source = value as {
      dataControllerName?: unknown;
      privacyContactEmail?: unknown;
    };
    this.workspace.setConfigurationPrivacyContact({
      dataControllerName: `${source.dataControllerName ?? ''}`,
      privacyContactEmail: `${source.privacyContactEmail ?? ''}`
    });
  }

  protected socialLinkUrlConfig(): LinkInputConfig {
    return {
      label: this.i18n.translate('operator.configuration.social.url'),
      placeholder: 'https://',
      required: true,
      maxLength: 2048,
      panelMode: 'anchored',
      pasteAriaLabel: this.i18n.translate(
        'operator.configuration.social.url.paste.aria'
      ),
      openAriaLabel: this.i18n.translate(
        'operator.configuration.social.url.open.aria'
      ),
      deleteAriaLabel: this.i18n.translate(
        'operator.configuration.social.url.clear.aria'
      )
    };
  }

  protected configurationIntegrationPublicBaseUrlConfig(): LinkInputConfig {
    return {
      label: this.i18n.translate(
        'operator.configuration.integration.public.url'
      ),
      placeholder: this.i18n.translate(
        'operator.configuration.integration.public.url.placeholder'
      ),
      required: true,
      maxLength: 2048,
      panelMode: 'anchored',
      pasteAriaLabel: this.i18n.translate(
        'operator.configuration.integration.public.url.paste.aria'
      ),
      openAriaLabel: this.i18n.translate(
        'operator.configuration.integration.public.url.open.aria'
      ),
      deleteAriaLabel: this.i18n.translate(
        'operator.configuration.integration.public.url.clear.aria'
      )
    };
  }

  protected setConfigurationSocialLink(
    index: number,
    patch: Partial<DeploymentSocialLinkDto>
  ): void {
    this.workspace.setConfigurationSocialLink(index, patch);
  }

  protected configurationSocialLinkRemoveItems(
    index: number
  ): readonly AppMenuItem<string, OperatorPopupActionContext>[] {
    return [{
      id: `operator-remove-social-link-${index}`,
      label: 'operator.configuration.social.remove',
      icon: 'delete_outline',
      palette: 'red',
      layout: 'action',
      disabled: this.configurationDisabled(),
      context: {
        action: 'remove-social-link',
        socialLinkIndex: index
      }
    }];
  }

  protected brandingLogoCharacterIndexInvalid(): boolean {
    const branding = this.workspace.configurationDraft()?.branding;
    if (!branding || branding.logoCharacterIndex === null) {
      return false;
    }
    const index = branding.logoCharacterIndex;
    return !Number.isInteger(index)
      || index < -1
      || index >= Array.from(branding.productName.trim()).length;
  }

  private readonly i18n = inject(I18nService);

  protected readonly workspace = inject(OperatorWorkspaceStore);

  protected readonly busyAction = this.workspace.busyAction;

  protected readonly busy = computed(() => this.busyAction() !== null);
 protected async onAction(event:AppMenuItemSelectEvent<string,OperatorPopupActionContext>):Promise<void>{
  const context=event.context;switch(context?.action){case 'save-branding':
        await this.workspace.saveConfiguration(
          'save-branding',
          'operator.configuration.branding.saved'
        );
        return;
case 'save-admin-emails':
        await this.workspace.saveConfiguration(
          'save-admin-emails',
          'operator.configuration.admin.saved'
        );
        return;
case 'save-privacy-contact':
        await this.workspace.saveConfiguration(
          'save-privacy-contact',
          'operator.configuration.privacy.contact.saved'
        );
        return;
case 'add-social-link':
        this.workspace.addConfigurationSocialLink();
        return;
case 'remove-social-link':
        if (context.socialLinkIndex !== undefined) {
          this.workspace.removeConfigurationSocialLink(
            context.socialLinkIndex
          );
        }
        return;
case 'save-social-links':
        await this.workspace.saveConfiguration(
          'save-social-links',
          'operator.configuration.social.saved'
        );
        return;
case 'save-integration':
        await this.workspace.saveConfiguration(
          'save-integration',
          'operator.configuration.integration.saved'
        );
        return;
case 'register-firebase':
        await this.workspace.saveConfiguration(
          'register-firebase',
          'operator.configuration.firebase.saved'
        );
        return;
case 'activate-firebase':
        await this.workspace.activateFirebase();
        return;
case 'test-authentication':
        await this.workspace.testConfiguration('FIREBASE_AUTHENTICATION');
        return;
case 'test-messaging':
        await this.workspace.testConfiguration('FIREBASE_MESSAGING');
        return;
case 'toggle-tls-auto-renew': {
        const draft = this.workspace.tlsConfigurationDraft();
        if (draft?.enabled && draft.mode === 'AUTOMATIC') {
          this.workspace.setTlsConfiguration({ autoRenew: !draft.autoRenew });
        }
        return;
      }
case 'set-tls-mode':
        if (context.tlsMode) {
          this.workspace.setTlsConfiguration({ mode: context.tlsMode });
        }
        return;
case 'test-tls-domain':
        await this.workspace.testTlsConfiguration('DOMAIN');
        return;
case 'test-tls-certificate':
        await this.workspace.testTlsConfiguration('CERTIFICATE');
        return;
case 'save-tls':
        await this.workspace.saveTlsConfiguration();
        return;
}
 }

  protected readonly configurationTlsModeItems = computed<
    readonly AppMenuItem<string, OperatorPopupActionContext>[]
  >(() => (['AUTOMATIC', 'MANUAL'] as const).map(tlsMode => ({
    id: `operator-configuration-tls-mode-${tlsMode.toLowerCase()}`,
    label: `operator.configuration.tls.mode.${tlsMode.toLowerCase()}`,
    icon: tlsMode === 'AUTOMATIC' ? 'workspace_premium' : 'key',
    kind: 'radio' as const,
    active: this.workspace.tlsConfigurationDraft()?.mode === tlsMode,
    checked: this.workspace.tlsConfigurationDraft()?.mode === tlsMode,
    context: { action: 'set-tls-mode' as const, tlsMode }
  })));

  protected readonly configurationTlsAutoRenewItems = computed<
    readonly AppMenuItem<string, OperatorPopupActionContext>[]
  >(() => {
    const draft = this.workspace.tlsConfigurationDraft();
    const enabled = draft?.autoRenew === true;
    return [{
      id: 'operator-toggle-tls-auto-renew',
      label: 'operator.configuration.tls.auto.renew',
      kind: 'toggle',
      layout: 'pill',
      showToggleIndicator: true,
      palette: 'teal',
      active: enabled,
      checked: enabled,
      disabled: this.configurationTlsDisabled()
        || draft?.enabled !== true
        || draft?.mode !== 'AUTOMATIC',
      closeOnSelect: false,
      ariaLabel: 'operator.configuration.tls.auto.renew',
      context: { action: 'toggle-tls-auto-renew' }
    }];
  });

  protected readonly configurationTlsTestActionItems = computed<
    readonly AppMenuItem<string, OperatorPopupActionContext>[]
  >(() => {
    const domainFeedback = this.workspace.tlsDomainFeedback();
    const certificateFeedback = this.workspace.tlsCertificateFeedback();
    return [{
      id: 'operator-test-tls-domain',
      label: 'operator.configuration.tls.test.domain',
      icon: domainFeedback === 'success'
        ? 'check_circle'
        : domainFeedback === 'error'
          ? 'error_outline'
          : 'dns',
      palette: domainFeedback === 'success'
        ? 'green'
        : domainFeedback === 'error'
          ? 'red'
          : 'blue',
      layout: 'action',
      disabled: this.configurationTlsDisabled()
        || !this.workspace.tlsConfigurationDraft()?.enabled
        || !this.workspace.tlsConfigurationReady()
        || domainFeedback !== null,
      progress: this.busyAction() === 'test-tls-domain'
        ? { state: 'loading', durationMs: 3000 }
        : domainFeedback
          ? { state: domainFeedback, durationMs: 1000 }
          : null,
      context: { action: 'test-tls-domain' }
    },
    {
      id: 'operator-test-tls-certificate',
      label: 'operator.configuration.tls.test.certificate',
      icon: certificateFeedback === 'success'
        ? 'check_circle'
        : certificateFeedback === 'error'
          ? 'error_outline'
          : 'verified_user',
      palette: certificateFeedback === 'success'
        ? 'green'
        : certificateFeedback === 'error'
          ? 'red'
          : 'orange',
      layout: 'action',
      disabled: this.configurationTlsDisabled()
        || !this.workspace.tlsConfigurationDraft()?.enabled
        || !this.workspace.tlsConfigurationReady()
        || certificateFeedback !== null,
      progress: this.busyAction() === 'test-tls-certificate'
        ? { state: 'loading', durationMs: 3000 }
        : certificateFeedback
          ? { state: certificateFeedback, durationMs: 1000 }
          : null,
      context: { action: 'test-tls-certificate' }
    }];
  });

  protected readonly configurationTlsSaveActionItems = computed<
    readonly AppMenuItem<string, OperatorPopupActionContext>[]
  >(() => {
    const saveFeedback = this.workspace.tlsSaveFeedback();
    return [{
      id: 'operator-save-tls',
      label: this.workspace.tlsConfigurationDraft()?.enabled
        ? 'operator.configuration.tls.save'
        : 'operator.configuration.tls.disable',
      icon: saveFeedback === 'success'
        ? 'check_circle'
        : saveFeedback === 'error'
          ? 'error_outline'
          : 'save',
      palette: saveFeedback === 'success'
        ? 'green'
        : saveFeedback === 'error'
          ? 'red'
          : 'violet',
      layout: 'action',
      disabled: this.configurationTlsDisabled()
        || !this.workspace.tlsConfigurationReady()
        || saveFeedback !== null,
      progress: this.busyAction() === 'save-tls'
        ? { state: 'loading', durationMs: 3000 }
        : saveFeedback
          ? { state: saveFeedback, durationMs: 1000 }
          : null,
      context: { action: 'save-tls' }
    }];
  });

  protected configurationTlsModeTrigger(): AppMenuTrigger {
    const mode =
      this.workspace.tlsConfigurationDraft()?.mode ?? 'AUTOMATIC';
    return {
      label: `operator.configuration.tls.mode.${mode.toLowerCase()}`,
      icon: mode === 'AUTOMATIC' ? 'workspace_premium' : 'key',
      palette: mode === 'AUTOMATIC' ? 'green' : 'amber',
      layout: 'field',
      disabled: this.configurationTlsDisabled(),
      ariaLabel: 'operator.configuration.tls.mode'
    };
  }

  protected configurationTlsDisabled(): boolean {
    return this.busy()
      || this.workspace.tlsConfiguration()?.capability !== 'AVAILABLE';
  }

  protected toggleTlsEnabled(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.configurationTlsDisabled()) {
      return;
    }
    this.workspace.setTlsConfiguration({
      enabled: !this.workspace.tlsConfigurationDraft()?.enabled
    });
  }

  protected showTlsSaveAction(): boolean {
    const configuration = this.workspace.tlsConfiguration();
    const draft = this.workspace.tlsConfigurationDraft();
    return draft?.enabled === true
      || Boolean(configuration?.enabled && draft && !draft.enabled);
  }

  protected formatDate(value: string | null | undefined): string {
    const timestamp = Date.parse(`${value ?? ''}`);
    if (!Number.isFinite(timestamp)) {
      return '—';
    }
    return new Intl.DateTimeFormat(this.i18n.currentLanguage(), {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(timestamp));
  }
}
