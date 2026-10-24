import { ExplanationGuideService } from '../../../shared/core/base/services/help/explanation-guide.service';
import { OnInit } from '@angular/core';
import { McpConnectionsComponent } from './mcp-connections.component';
import { IntegrationAccessButtonComponent } from './integration-access-button.component';
import { IntegrationSettingsStore } from '../../../shared/ui/context/stores/profile/integration-settings.store';
import {
  CopyLinkComponent,
  IndicatorComponent,
  PopupComponent,
  type PopupActionEvent,
  type PopupModel,
  AppMenuComponent,
  type AppMenuItem,
  type AppMenuItemSelectEvent,
  type AppMenuModel,
  I18nPipe,
  DialogStore
} from '@fssrepository/myscoutee-components';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, computed, effect, inject, signal, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { IntegrationService } from '../../../shared/core/base/services/integrations/integration.service';
import { I18nService } from '../../../shared/core/base/services/localization/i18n.service';

import type {
  IntegrationTokenDto
} from '../../../shared/core/contracts/integrations/integration.interface';

type IntegrationActionContext =
  | { action: 'revoke'; token: IntegrationTokenDto };

@Component({
  selector: 'app-integration-settings-popup',
  standalone: true,
  providers: [IntegrationSettingsStore],
  imports: [
    IntegrationAccessButtonComponent,
    McpConnectionsComponent,
    CopyLinkComponent,
    IndicatorComponent,
    CommonModule,
    MatIconModule,
    PopupComponent,
    AppMenuComponent,
    I18nPipe
  ],
  templateUrl: './integration-settings-popup.component.html',
  styleUrl: './integration-settings-popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntegrationSettingsPopupComponent implements OnInit, OnDestroy {
  readonly closed = output<void>();
  ngOnInit(): void { this.openPopup(); }
  protected readonly store = inject(IntegrationSettingsStore);
  private readonly explanationGuide = inject(ExplanationGuideService);
  private unregisterExplanationContext: (() => void) | null = null;
  @Input() adminMode = false;
  @Input() roleReadOnly = false;
  private unregisterHelpContext: (() => void) | null = null;
  private readonly integrationService = inject(IntegrationService);
  private readonly i18nService = inject(I18nService);
  private readonly dialogStore = inject(DialogStore);

  protected readonly open = signal(false);
  protected readonly helpOpen = signal(false);

  protected readonly loading = this.store.loading;
  protected readonly mutating = this.store.busy;
  protected readonly settings = this.store.settings;
  protected readonly revealedToken = signal('');
  protected readonly revealedTokenId = signal('');
  private readonly clearRevealedTokenOnContextChange = effect(() => {
    this.store.contextVersion();
    this.revealedToken.set('');
    this.revealedTokenId.set('');
  });
  protected readonly errorMessage = this.store.error;
  protected readonly baseUrl = computed(() => this.integrationService.absoluteBaseUrl(this.settings()?.baseUrl ?? ''));
  protected readonly canGenerate = computed(() => {
    const settings = this.settings();
    return !!settings && settings.tokens.length < settings.maxActiveTokens && !this.mutating();
  });
  protected readonly actionMenuModel: AppMenuModel = { actionSizing: 'content' };
  protected readonly generateTokenActions = computed<readonly AppMenuItem[]>(() => [{
    id: 'generate-integration-token',
    kind: 'action',
    icon: 'key',
    label: 'integration.token.generate',
    ariaLabel: 'integration.token.generate.aria',
    layout: 'action',
    palette: 'blue',
    disabled: !this.canGenerate(),
    progress: this.mutating() ? { state: 'loading', shape: 'button' } : null
  }]);

  protected readonly popupModel = computed<PopupModel>(() => {
    return {
      errorMessage: this.errorMessage(),
      title: 'integration.title',
      subtitle: this.adminMode || this.roleReadOnly ? 'integration.roles.summary' : undefined,
      ariaLabel: 'integration.title',
      closeAriaLabel: 'close',
      size: 'small',
      height: 'full',
      bodyLayout: 'fill',
      mobilePresentation: 'fullscreen',
      backdropTone: 'dim',
      headerActions: [...(this.store.dirty() ? [{
        id: 'integration-save', icon: 'check', ariaLabel: 'save', palette: 'green' as const,
        disabled: this.mutating() || this.loading(), guideFieldId: 'integration-access-save'
      }] : []), {
        id: 'integration-help',
        icon: 'question_mark',
        ariaLabel: 'integration.help.aria',
        palette: 'blue'
      }],
      onAction: event => this.onPopupAction(event),
      onClose: () => this.closePopup()
    };
  });

  protected helpPopupModel(): PopupModel {
    return {
      title: 'integration.help.title',
      subtitle: 'integration.title',
      ariaLabel: 'integration.help.aria',
      closeAriaLabel: 'close',
      size: 'small',
      height: 'auto',
      mobilePresentation: 'compact',
      backdropTone: 'dim',
      headerPalette: 'blue',
      onClose: () => this.closeHelp()
    };
  }

  openPopup(event?: Event): void {
    event?.stopPropagation();
    this.open.set(true);
    this.unregisterExplanationContext ??= this.explanationGuide.registerContext('profile.integrations');
    this.revealedToken.set('');
    this.revealedTokenId.set('');
    this.errorMessage.set('');
    void this.store.open(this.adminMode, this.adminMode || this.roleReadOnly);
  }

  ngOnDestroy(): void {
    this.store.close();
    this.closeHelp();
    this.unregisterExplanationContext?.();
    this.unregisterExplanationContext = null;
  }

  protected closePopup(): void {
    if (this.mutating()) return;
    this.open.set(false);
    this.store.close();
    this.closeHelp();
    this.unregisterExplanationContext?.();
    this.unregisterExplanationContext = null;
    this.helpOpen.set(false);
    this.revealedToken.set('');
    this.revealedTokenId.set('');
    this.closed.emit();
  }

  private closeHelp(): void {
    this.helpOpen.set(false);
    this.unregisterHelpContext?.();
    this.unregisterHelpContext = null;
  }

  private onPopupAction(event: PopupActionEvent): void {
    event.sourceEvent.stopPropagation();
    if (event.action.id === 'integration-help') {
      this.helpOpen.set(true);
      this.unregisterHelpContext ??= this.explanationGuide.registerContext('profile.integration-help');
    } else if (event.action.id === 'integration-save') {
      void this.store.save().then(saved => { if (saved) this.closePopup(); });
    }
  }

  protected requestGenerate(): void {
    if (!this.canGenerate()) {
      return;
    }
    const name = this.i18nService.translateParams(
      'integration.token.client.name',
      { index: (this.settings()?.tokens.length ?? 0) + 1 }
    );
    const expiresInDays = 90;
    this.dialogStore.open({
      title: 'integration.token.generate.confirm.title',
      message: this.i18nService.translateParams(
        'integration.token.generate.confirm.message',
        { name, days: expiresInDays }
      ),
      confirmLabel: 'integration.token.generate.confirm',
      busyConfirmLabel: 'integration.token.generating',
      confirmTone: 'accent',
      failureMessage: 'integration.token.generate.failed',
      onConfirm: async () => {
          const created = await this.store.createApi(name, expiresInDays);
          if (!created) return;
          this.revealedToken.set(created.value);
          this.revealedTokenId.set(created.token.id);
      }
    });
  }

  protected requestRevoke(token: IntegrationTokenDto): void {
    if (this.mutating()) {
      return;
    }
    this.dialogStore.open({
      title: 'integration.token.revoke.confirm.title',
      message: this.i18nService.translateParams(
        'integration.token.revoke.confirm.message',
        { name: token.name }
      ),
      warningMessage: 'integration.token.revoke.warning',
      confirmLabel: 'integration.token.revoke',
      busyConfirmLabel: 'integration.token.revoking',
      confirmTone: 'danger',
      failureMessage: 'integration.token.revoke.failed',
      onConfirm: async () => {
        await this.store.revokeApi(token.id);
        if (this.revealedTokenId() === token.id) { this.revealedToken.set(''); this.revealedTokenId.set(''); }
      }
    });
  }

  protected onGenerateTokenAction(event: AppMenuItemSelectEvent): void {
    if (event.id === 'generate-integration-token') {
      this.requestGenerate();
    }
  }

  protected revokeTokenActions(token: IntegrationTokenDto): readonly AppMenuItem<string, IntegrationActionContext>[] {
    return [{
      id: `revoke-integration-token-${token.id}`,
      kind: 'action',
      icon: 'delete',
      ariaLabel: this.i18nService.translateParams(
        'integration.token.revoke.aria',
        { name: token.name }
      ),
      layout: 'icon',
      palette: 'danger',
      disabled: this.mutating(),
      context: { action: 'revoke', token }
    }];
  }

  protected onTokenAction(event: AppMenuItemSelectEvent): void {
    const context = event.context as IntegrationActionContext | undefined;
    if (context?.action === 'revoke') {
      this.requestRevoke(context.token);

    }
  }

  protected formatDate(value: string | null): string {
    const date = new Date(value ?? '');
    return Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
      : '—';
  }

}
