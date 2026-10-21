import { APP_STATIC_DATA } from '../../../shared/core/common/app-static-data';
import type { ProfileStatus } from '../../../shared/core/common/constants';
import { ProfileHeaderCardConverter } from '../../../shared/ui/converters/profile/profile-header-card.converter';
import { IntegrationSettingsPopupComponent } from '../integration-settings-popup/integration-settings-popup.component';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppMenuComponent, FormFlowComponent, HeaderCardComponent, ImageCarouselComponent, PopupComponent, type AppMenuItemSelectEvent, type AppMenuPalette, type HeaderCardModel, type FormFlowModel, type PopupModel } from '@fssrepository/myscoutee-components';
import { ProfileEditorStore } from '../../../shared/ui/context/stores/profile/profile-editor.store';
import { UserProfileStore } from '../../../shared/ui/context/stores/profile/user-profile.store';
import { I18nService } from '../../../shared/core/base/services/localization/i18n.service';

@Component({
  selector: 'app-profile-editor', standalone: true,
  imports: [IntegrationSettingsPopupComponent, FormsModule, AppMenuComponent, FormFlowComponent, HeaderCardComponent, ImageCarouselComponent, PopupComponent],
  templateUrl: './profile-editor.component.html',
  styleUrl: './profile-editor.component.scss'
})
export class ProfileEditorComponent {
  protected readonly apiOpen = signal(false);
  protected readonly panel = signal<'profile' | 'image'>('profile');
  protected readonly editor = inject(ProfileEditorStore);
  protected readonly profiles = inject(UserProfileStore);
  private readonly i18n = inject(I18nService);
  protected readonly popup = computed<PopupModel>(() => ({
    title: this.editor.onboarding() ? 'profile.setup' : this.profiles.activeUserIsOperator() ? 'Operator profile' : this.profiles.activeUserIsAdmin() ? "admin.profile" : "profile", size: 'wide', height: 'full', bodyLayout: 'fill', errorMessage: this.editor.error(),
    closeOnBackdrop: !this.editor.busy(), showClose: !this.editor.busy(), onClose: () => this.editor.close(),
    headerControls: [
      ...(!this.profiles.activeUserIsAdmin() && !this.profiles.activeUserIsOperator() ? [{
        id: 'profile-status', kind: 'menu' as const, menuKind: 'select' as const, panelAlign: 'end' as const,
        trigger: this.profileStatusMenuTrigger(), items: this.profileStatusMenuItems()
      }] : []),
      { id: 'profile-actions', kind: 'menu', menuKind: 'inline', panelAlign: 'end', items: [{
      id: 'profile-save', guideId: 'profile-save', icon: 'done', kind: 'action', palette: 'green',
      ariaLabel: "save.profile", disabled: !this.editor.valid() || this.editor.busy(),
      progress: { state: this.editor.saving() ? 'loading' : this.editor.error() ? 'error' : null, shape: 'circle' }
    }] }],
    onMenuSelect: event => {
      if (event.itemSelect.id === 'profile-save') void this.editor.save();
      else {
        const option = APP_STATIC_DATA.profileStatusOptions.find(option => `profile-status-${option.value}` === event.itemSelect.id);
        if (option) this.editor.draft.update(draft => ({ ...draft, profileStatus: option.value }));
      }
    }
  }));
  protected readonly header = computed<HeaderCardModel>(() => {
    const user = this.profiles.activeUserProfile();
    if (!user) return {};
    const operator = this.profiles.activeUserIsOperator();
    const model = ProfileHeaderCardConverter.convert({ ...user, ...this.editor.draft() }, {
      admin: this.profiles.activeUserIsAdmin() || operator,
      headline: operator ? this.editor.draft().headline?.trim() || 'Operator workspace' : undefined,
      showEdit: true, editDisabled: this.editor.busy(), editAriaLabel: "open.image.editor",
      showRing: this.editor.saving(), ringState: 'loading'
    });
    return operator ? { ...model, badgeLabel: 'OPERATOR', metaIcon: 'settings_input_component' } : model;
  });
  protected profileStatusMenuTrigger() {
    const status = this.editor.draft().profileStatus ?? 'public';
    return { label: status, icon: this.profileStatusIcon(status), palette: this.profileStatusPalette(status),
      layout: 'pill' as const, ariaLabel: "profile.status.select.aria" };
  }
  private profileStatusMenuItems() {
    const currentStatus = this.editor.draft().profileStatus ?? 'public';
    return APP_STATIC_DATA.profileStatusOptions.map(option => ({
      id: `profile-status-${option.value}`, label: option.value, icon: option.icon,
      kind: 'radio' as const, value: option.value,
      active: option.value === currentStatus, checked: option.value === currentStatus,
      showCheck: true,
      palette: this.profileStatusPalette(option.value), surface: 'tinted' as const
    }));
  }
  private profileStatusIcon(status: ProfileStatus): string {
    return APP_STATIC_DATA.profileStatusOptions.find(option => option.value === status)?.icon
      ?? (status === 'blocked' ? 'block' : status === 'deleted' ? 'delete' : 'public');
  }
  private profileStatusPalette(status: ProfileStatus): AppMenuPalette {
    switch (status) {
      case 'public': return 'green';
      case 'friends only': return 'blue';
      case 'host only': return 'brown';
      case 'inactive': return 'muted';
      case 'blocked': case 'deleted': return 'red';
      default: return 'neutral';
    }
  }
  protected readonly imagePopup: PopupModel = {
    title: "image.carousel.images", ariaLabel: "image.carousel.images", closeAriaLabel: "close",
    size: 'wide', height: 'full', bodyLayout: 'fill',
    onClose: () => this.panel.set('profile')
  };
  protected readonly form = computed<FormFlowModel>(() => ({
    title: this.i18n.translate('profile.edit'), header: false, layout: 'grouped', summary: { enabled: false },
    steps: [{ id: 'basics', title: 'basics', subtitle: 'profile.editor.basics.description', icon: 'badge', controls:
      this.profiles.activeUserIsAdmin() || this.profiles.activeUserIsOperator() ? [
        { id: 'full-name', kind: 'text', label: 'name', bind: 'name', required: true, placeholder: 'name' },
        { id: 'headline', kind: 'text', label: "headline", bind: 'headline', placeholder: "admin.workspace" },
        { id: 'about', kind: 'textarea', label: 'about', bind: 'about', rows: 3, maxLength: 160 }
      ] : [
        { id: 'name', bind: 'name', kind: 'text', label: this.i18n.translate('profile.name'), required: true, maxLength: 80 }
      ]
    }]
  }));
  protected openApi(event: AppMenuItemSelectEvent): void {
    event.sourceEvent.stopPropagation();
    this.apiOpen.set(true);
  }
  protected updateImages(images: string[]): void { this.editor.draft.update(draft => ({ ...draft, images })); }
}
