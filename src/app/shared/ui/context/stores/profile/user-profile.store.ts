import { Injectable,computed,signal } from '@angular/core';
import type { UserDto } from '../../../../core/contracts/accounts/user.interface';
import { hasOperatorRole } from '../../../../core/common/user-role';
const cloneUserProfile=(user: UserDto): UserDto => structuredClone(user);
@Injectable({ providedIn: 'root' })
export class UserProfileStore {
  private readonly _userProfilesByUserId=signal<Record<string,UserDto>>({});

  private readonly _activeUserId=signal<string>('');

  readonly userProfilesByUserId=this._userProfilesByUserId.asReadonly();

  readonly activeUserId=this._activeUserId.asReadonly();

  readonly activeUserProfile=computed(() => {
    const normalizedUserId=this._activeUserId().trim();
    if(!normalizedUserId) {
      return null;
    }
    const user=this._userProfilesByUserId()[normalizedUserId];
    return user? cloneUserProfile(user):null;
  });

  readonly activeNotificationDevices=computed(() => this.activeUserProfile()?.notificationDevices??[]);

  applyUserRealtimeNotificationDevices(userId: string,devices: UserDto['notificationDevices']): void {
    if(!devices) return;
    const current=this._userProfilesByUserId()[userId];
    if(!current) return;
    if(JSON.stringify(current.notificationDevices)===JSON.stringify(devices)) return;
    this._userProfilesByUserId.update(state => ({
      ...state,[userId]: {
        ...current,notificationDevices: devices.map(device => ({ ...device }))
      }
    }));
  }

  readonly activeUserIsOperator=computed(() =>
    hasOperatorRole(this.activeUserProfile())
  );

  readonly activeUserLocationMissing=computed(() => {
    const user=this.activeUserProfile();
    if(!user||this.activeUserIsAdmin()||this.activeUserIsOperator()) return false;
    return !Number.isFinite(user.locationCoordinates?.latitude)
      ||!Number.isFinite(user.locationCoordinates?.longitude);
  });

  getActiveUserId(): string {
    return this._activeUserId();
  }

  setActiveUserId(userId: string): void {
    const normalizedUserId=userId.trim();
    this._activeUserId.set(normalizedUserId);
  }

  getUserProfile(userId: string): UserDto|null {
    const normalizedUserId=userId.trim();
    if(!normalizedUserId) {
      return null;
    }
    const user=this._userProfilesByUserId()[normalizedUserId];
    return user? cloneUserProfile(user):null;
  }

  setUserProfile(user: UserDto): void {
    const normalizedUserId=user.id.trim();
    if(!normalizedUserId) {
      return;
    }
    this._userProfilesByUserId.update(state => ({
      ...state,
      [normalizedUserId]: cloneUserProfile({
        ...user,
        id: normalizedUserId
      })
    }));
  }
  readonly activeUserIsAdmin=computed(() => this.activeUserProfile()?.admin===true);
  patchUserActivityCounters(userId: string, patch: Partial<UserDto['activities']>): UserDto | null {
    const user = this.getUserProfile(userId);
    if (!user) return null;
    this.setUserProfile({ ...user, activities: { ...user.activities, ...patch } });
    return this.getUserProfile(userId);
  }
  patchUserNotificationPreferences(userId: string, muted: boolean): UserDto | null {
    const user = this.getUserProfile(userId);
    if (!user) return null;
    this.setUserProfile({ ...user, notificationPreferences: { ...user.notificationPreferences, muted } });
    return this.getUserProfile(userId);
  }
  setActiveUserProfile(user: UserDto): void { this.setUserProfile(user); this.setActiveUserId(user.id); }
}
