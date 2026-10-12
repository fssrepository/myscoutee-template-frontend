import { Injectable, computed, effect, inject, signal, untracked, type Type } from '@angular/core';
import { scheduleAfterPaint, type PopupModel } from '@fssrepository/myscoutee-components';
import type { UserDto } from '../../../../core/contracts/accounts/user.interface';
import { UsersService } from '../../../../core/base/services/accounts/users.service';
import { AppUtils } from '../../../../core/base/app-utils';
import { UserProfileStore } from './user-profile.store';

export interface ProfileDraft { name: string; images: string[]; profileStatus?: UserDto['profileStatus']; about?: string; headline?: string; }

@Injectable({ providedIn: 'root' })
export class ProfileEditorStore {
  private readonly users = inject(UsersService);
  private readonly profiles = inject(UserProfileStore);
  private editingUserId = '';
  private onSaved?: (user: UserDto) => Promise<void>;
  private onCancel?: () => Promise<void>;
  readonly onboarding = computed(() => this.profiles.activeUserProfile()?.profileStatus === 'onboarding');
  readonly open = signal(false);
  private readonly componentRef = signal<Type<unknown> | null>(null);
  private componentLoad: Promise<void> | null = null;
  readonly component = this.componentRef.asReadonly();
  readonly loadFailed = signal(false);
  readonly loadingModel: PopupModel = {
    title: 'Profile', ariaLabel: 'Profile', size: 'wide', height: 'full', bodyLayout: 'fill',
    onClose: () => this.close()
  };
  readonly draft = signal<ProfileDraft>({ name: '', images: [] });
  readonly saving = signal(false);
  readonly uploading = signal(false);
  readonly error = signal('');
  readonly busy = computed(() => this.saving() || this.uploading());
  readonly valid = computed(() => !!this.draft().name.trim() && this.draft().name.trim().length <= 80);

  constructor() {
    effect(() => {
      const activeId = this.profiles.activeUserId();
      untracked(() => {
        if (this.editingUserId && activeId !== this.editingUserId) {
          this.open.set(false);
          this.draft.set({ name: '', images: [] });
          this.error.set('');
          this.editingUserId = '';
          this.onSaved = undefined;
          this.onCancel = undefined;
        }
      });
    });
  }

  begin(options?: { onSaved: (user: UserDto) => Promise<void>; onCancel: () => Promise<void> }): void {
    const user = this.profiles.activeUserProfile();
    if (!user || this.busy()) return;
    this.editingUserId = user.id;
    this.onSaved = options?.onSaved;
    this.onCancel = options?.onCancel;
    this.draft.set({ name: user.name, images: [...user.images ?? []], profileStatus: user.profileStatus, about: user.about, headline: user.headline });
    this.error.set('');
    this.open.set(true);
    void this.ensureLoaded();
  }

  async ensureLoaded(): Promise<void> {
    if (this.componentRef()) return;
    if (this.componentLoad) return this.componentLoad;
    this.loadFailed.set(false);
    // Native ProfileStore boundary: paint the popup before importing the editor.
    this.componentLoad = new Promise<void>(resolve => scheduleAfterPaint(resolve))
      .then(() => import('../../../../../profile/components/profile-editor/profile-editor.component'))
      .then(module => { this.componentRef.set(module.ProfileEditorComponent); })
      .catch(() => { this.loadFailed.set(true); })
      .finally(() => { this.componentLoad = null; });
    return this.componentLoad;
  }

  close(): void {
    if (this.busy()) return;
    this.open.set(false);
    const cancel = this.onCancel;
    this.onSaved = undefined;
    this.onCancel = undefined;
    void cancel?.();
  }

  async save(): Promise<void> {
    const current = this.profiles.activeUserProfile();
    if (!this.open() || this.busy() || !this.valid() || current?.id !== this.editingUserId) return;
    const draft = this.draft();
    this.saving.set(true);
    this.error.set('');
    try {
      // Start with the current profile, not an empty DTO: fields outside this form stay intact.
      const saved = await this.users.saveUserProfile({
        ...current, name: draft.name.trim(), initials: AppUtils.initialsFromText(draft.name), images: [...draft.images], profileStatus: draft.profileStatus ?? current.profileStatus,
        about: draft.about ?? current.about, headline: draft.headline ?? current.headline,
        ...(this.onboarding() ? { profileStatus: 'public' as const, deletedAtIso: null } : {})
      });
      if (saved && this.profiles.activeUserId() === current.id) {
        const complete = this.onSaved;
        this.onSaved = undefined;
        this.onCancel = undefined;
        this.open.set(false);
        await complete?.(saved);
      }
    } catch {
      this.error.set('profile.save.failed');
    } finally {
      this.saving.set(false);
    }
  }
}
