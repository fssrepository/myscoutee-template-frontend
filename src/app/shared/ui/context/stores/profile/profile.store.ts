import { Injectable, computed, signal } from '@angular/core';

export type ProfileSettingsPopup = 'privacy' | 'terms' | 'help';

/** Selected settings state from the native ProfileStore; product editors are not imported. */
@Injectable({ providedIn: 'root' })
export class ProfileStore {
 private readonly settingsPopupRef = signal<ProfileSettingsPopup | null>(null);
 private readonly privacyConsentRequiredKeyRef = signal('');
 readonly settingsPopup = this.settingsPopupRef.asReadonly();
 readonly privacyConsentRequired = computed(() => this.privacyConsentRequiredKeyRef().length > 0);
 readonly privacyConsentRequiredKey = this.privacyConsentRequiredKeyRef.asReadonly();
 openSettingsPopup(popup: ProfileSettingsPopup): void { this.settingsPopupRef.set(popup); }
 closeSettingsPopup(options: { force?: boolean; keepPrivacyOpen?: boolean } = {}): void {
  if (options.force !== true && options.keepPrivacyOpen === true && this.settingsPopupRef() === 'privacy') return;
  this.settingsPopupRef.set(null);
 }
 requirePrivacyConsent(key: string): void { this.privacyConsentRequiredKeyRef.set(key.trim()); }
 clearPrivacyConsentRequirement(): void { this.privacyConsentRequiredKeyRef.set(''); }

}
