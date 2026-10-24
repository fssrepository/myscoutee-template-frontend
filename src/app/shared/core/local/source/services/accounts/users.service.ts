
import type { BootstrapProcessState } from '../../../../base/services/platform/bootstrap.service';
import type { UserLogoutRequestDto, UserDeleteRequestDto, UserSubmitActionResponseDto } from '../../../../contracts/accounts/user.interface';
import type { UserRealtimeLongPollResponseDto } from '../../../../contracts/accounts/user.interface';
import { LocalNotificationsRepository } from '../../repositories/notifications/notifications.repository';
import { Injectable, inject } from '@angular/core';
import type { UserService, UserDto, UserSelectorRole, UserSelectorListItemDto, UserByIdQueryResponse, LocationCoordinates, UserLocationEligibilityResponseDto } from '../../../../contracts/accounts/user.interface';
import { APP_STORAGE_KEYS } from '../../../../common/storage-scope';
import { LocalUsersRepository } from '../../repositories/accounts/users.repository';
import { LocalCountryPartitionsRepository } from '../../repositories/platform/country-partitions.repository';
import { LocalUsersMapper } from '../../mappers/accounts/user.mapper';
import { LocalRouteDelayService } from '../platform/route-delay.service';
@Injectable({ providedIn: 'root' })
export class LocalUsersService extends LocalRouteDelayService implements UserService {
  async prepareUserSession(
    userId: string,
    onProgress?: (state: BootstrapProcessState) => void
  ): Promise<void> {
    if (!userId.trim()) {
      return;
    }
    onProgress?.({
      percent: 100,
      label: 'Demo session ready',
      stage: 'sessionReady'
    });
  }
  private static readonly INELIGIBLE_REGION_MESSAGE = 'Unavailable in your country';

  private static readonly DEMO_COUNTRY_CODE_STORAGE_KEY = APP_STORAGE_KEYS.demoCountryCode;

  private static readonly DEMO_USERS_ROUTE = '/auth/demo-users';

  private static readonly USER_BY_ID_ROUTE = '/auth/me';

  private readonly countryPartitionsRepository = inject(LocalCountryPartitionsRepository);

  private readonly usersRepository = inject(LocalUsersRepository);
  private readonly notifications = inject(LocalNotificationsRepository);
  peekCachedUserById(userId: string): UserDto | null {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) return null;
    const user = this.usersRepository.queryUserById(normalizedUserId);
    return user ? LocalUsersMapper.toDto(user) : null;
  }
  async queryUserRealtimeLongPoll(userId: string, _cursor: string | null = null, signal?: AbortSignal): Promise<UserRealtimeLongPollResponseDto | null> {
    await Promise.all([this.usersRepository.whenReady(), this.waitForRouteDelay('/auth/me/realtime/long-poll', signal)]);
    signal?.throwIfAborted();
    const record = this.usersRepository.queryUserById(userId.trim());
    if (!record) return null;
    const user = LocalUsersMapper.toDto(record);
    const counters = { ...user.activities, notifications: user.activities.notifications ?? 0 };
    return { userId: user.id, profileStatus: user.profileStatus, locationCoordinates: user.locationCoordinates,
      notificationDevices: user.notificationDevices, counters,
      cursor: `${user.id.replace(/:/g, '%3A')}:${counters.chats ?? 0}:${counters.notifications}:${JSON.stringify(counters.chat?.supportCases ?? {})}:${user.profileStatus}`,
      serverTsIso: new Date().toISOString() };
  }

  async checkLocationEligibility(coordinates?: LocationCoordinates | null): Promise<UserLocationEligibilityResponseDto> {
    const overrideCountryCode = this.readDemoCountryCodeOverride();
    const partitionKey = this.countryPartitionsRepository.resolvePartitionKeyByCountryCode(overrideCountryCode);
    const validCoordinates = !coordinates || (Number.isFinite(coordinates.latitude)
      && Number.isFinite(coordinates.longitude) && Math.abs(coordinates.latitude) <= 90
      && Math.abs(coordinates.longitude) <= 180);
    const eligible = validCoordinates && (!overrideCountryCode || Boolean(partitionKey));
    return {
      eligible,
      partitionKey,
      message: eligible ? null : LocalUsersService.INELIGIBLE_REGION_MESSAGE,
      securityGateEnabled: false,
      locationRequired: false
    };
  }

  private readDemoCountryCodeOverride(): string {
    if (typeof localStorage === 'undefined') {
      return '';
    }
    try {
      return this.normalizeCountryCode(localStorage.getItem(LocalUsersService.DEMO_COUNTRY_CODE_STORAGE_KEY));
    } catch {
      return '';
    }
  }

  private normalizeCountryCode(countryCode: string | null | undefined): string {
    return `${countryCode ?? ''}`
      .trim()
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 2);
  }

  async queryUserById(userId?: string, _requestTimeoutMs?: number): Promise<UserByIdQueryResponse> {
    const [, response] = await Promise.all([
      this.waitForRouteDelay(LocalUsersService.USER_BY_ID_ROUTE),
      (async (): Promise<UserByIdQueryResponse> => {
        await this.usersRepository.whenReady();
        return this.readUserById(userId);
      })()
    ]);
    return response;
  }

  private async validateLocationForSave(coordinates?: LocationCoordinates | null): Promise<void> {
    if (coordinates && !(await this.checkLocationEligibility(coordinates)).eligible) {
      throw new Error(LocalUsersService.INELIGIBLE_REGION_MESSAGE);
    }
  }
 async queryAvailableDemoUsers(selectorRole: UserSelectorRole = 'member'): Promise<UserSelectorListItemDto[]> {
  const [, users] = await Promise.all([this.waitForRouteDelay(LocalUsersService.DEMO_USERS_ROUTE), (async () => {
   await this.usersRepository.whenReady();
   return LocalUsersMapper.toSelectorListItemList(this.usersRepository.queryAvailableDemoUsers(selectorRole));
  })()]);
  return users.map(user => ({ ...user, locationRequired: selectorRole === 'member' && user.locationRequired === true }));
 }
 private async readUserById(userId?: string): Promise<UserByIdQueryResponse> {
  const record = this.usersRepository.queryUserById(userId?.trim() ?? '');
  return { user: record ? LocalUsersMapper.toDto(record) : null };
 }
 async saveUserProfile(user: UserDto): Promise<UserDto | null> {
   return this.withRouteDelay(LocalUsersService.USER_BY_ID_ROUTE, async (): Promise<UserDto | null> => {
    if (!user?.id?.trim()) return null;
    await this.usersRepository.whenReady();
    await this.validateLocationForSave(user.locationCoordinates);
    const record = LocalUsersMapper.toRecord(user);
    if (!record.partitionKey && !this.usersRepository.queryUserById(user.id)?.partitionKey) {
      const partition = this.countryPartitionsRepository.randomPartition();
      record.partitionKey = partition.partitionKey;
      record.city ||= partition.city;
      record.locationCoordinates ??= partition.locationCoordinates;
    }
    const saved = this.usersRepository.upsertUser(record);
    await this.usersRepository.flushToIndexedDb();
    return LocalUsersMapper.toDto(saved);
   });
 }
 async deleteUser(request: UserDeleteRequestDto, signal?: AbortSignal): Promise<UserSubmitActionResponseDto> {
   return this.withRouteDelay(LocalUsersService.USER_BY_ID_ROUTE, async (): Promise<UserSubmitActionResponseDto> => {
    await this.usersRepository.whenReady();
    const user = this.usersRepository.queryUserById(request.userId.trim());
    if (user) {
     this.usersRepository.upsertUser({
      ...user, profileStatus: 'deleted',
      previousProfileStatus: user.profileStatus === 'deleted' ? user.previousProfileStatus ?? 'public' : user.profileStatus,
      deletedAtIso: new Date().toISOString()
     });
     await this.usersRepository.flushToIndexedDb();
    }
    return { submitted: true, message: null };
   }, signal);
 }
  async logoutUser(
    _request: UserLogoutRequestDto,
    signal?: AbortSignal,
    _requestTimeoutMs?: number
  ): Promise<UserSubmitActionResponseDto> {
    await this.waitForRouteDelay(LocalUsersService.USER_BY_ID_ROUTE, signal);
    return {
      submitted: true,
      message: null
    };
  }
}
