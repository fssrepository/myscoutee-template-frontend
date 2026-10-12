import type * as AppConstants from '../../common/constants';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface FirebaseAuthProfileDto {
  id: string;
  name: string;
  email: string;
  initials: string;
  imageUrl?: string;
}

export type FirebaseAuthProvider='google'|'facebook'|'email';

export type FirebaseEmailAuthMode='sign-in'|'create';

export interface FirebaseAuthRequestDto {
  provider: FirebaseAuthProvider;
  emailMode?: FirebaseEmailAuthMode;
  email?: string;
  password?: string;
}

export interface UserSessionLoginRequestDto {
  attemptId: string;
  provider?: string;
}

export interface UserSessionLoginResponseDto {
  accepted: boolean;
  existingSession: boolean;
  outcome: 'ACCEPTED'|'BLOCKED_LIMIT'|string;
  activeSessionCount: number;
  /** -1 means the concurrent-session limit is disabled. */
  maxActiveSessions: number;
  message?: string|null;
}

export interface OperatorBootstrapAuthRequestDto {
  email: string;
  password: string;
}

export interface OperatorBootstrapAuthResponseDto {
  tokenType: 'OperatorBootstrap';
  accessToken: string;
  email: string;
  expiresAt: string;
}

export interface EntryConsentStateDto {
  version: string;
  accepted: boolean;
  acceptedAtIso: string;
}

export interface EntryConsentAuditRecordDto {
  tsIso: string;
  action: 'accepted'|'rejected';
  version: string;
  source: 'entry';
  userAgent: string;
}

export interface UserNotificationPreferencesDto {
  muted?: boolean;
}

export interface UserSupportCaseCountersDto {
  pending?: number;
  warned?: number;
  picked?: number;
  solved?: number;
  blocked?: number;
  all?: number;
}

export interface UserNotificationDeviceDto {
  deviceId: string;
  notificationsEnabled: boolean;
}

export interface UserLocationEligibilityResponseDto {
  eligible: boolean;
  partitionKey?: string|null;
  message?: string|null;
  securityGateEnabled?: boolean;
  locationRequired?: boolean;
}

export type UserSelectorRole='member'|'operator'|'admin';

export interface UserLogoutRequestDto {
  userId: string;
}

export interface UserDeleteRequestDto {
  userId: string;
}

export interface UserSubmitActionResponseDto {
  submitted: boolean;
  message?: string|null;
}

export class UserDto {
  workspaceGroupId?: string | null;
  id='';

  name='';

  city='';

  completion=0;

  headline='';

  about='';

  initials='';

  gender: AppConstants.UserGender='man';

  profileFormVersion?: number;

  locationCoordinates?: LocationCoordinates;

  partitionKey?: string;

  images?: string[];

  profileStatus: AppConstants.ProfileStatus='public';

  previousProfileStatus?: AppConstants.ProfileStatus|null;

  deletedAtIso?: string|null;

  admin?: boolean;

  operator?: boolean;

  notificationPreferences?: UserNotificationPreferencesDto;

  notificationDevices?: UserNotificationDeviceDto[];
  activities: UserMenuCountersDto={};
}
export interface UserMenuCountersDto { chats?: number; notifications?: number; chat?: UserChatCountersDto; }
export interface UserRealtimeLongPollResponseDto {
 userId: string;
 profileStatus?: UserDto['profileStatus'] | null;
 locationCoordinates?: LocationCoordinates | null;
 notificationDevices?: UserDto['notificationDevices'];
 counters: UserMenuCountersDto;
 cursor: string | null;
 serverTsIso: string;
}
export interface UserChatCountersDto { all?: number; contacts?: number; appSupport?: number; supportCases?: UserSupportCaseCountersDto; }
export interface UserByIdQueryResponse { user: UserDto|null; counterOverrides?: UserMenuCountersDto|null; }
export interface UserSelectorListItemDto { id: string; name: string; initials: string; city: string; gender: AppConstants.UserGender; avatarUrl?: string; locationCoordinates?: LocationCoordinates|null; locationRequired?: boolean; profileFormVersion?: number; status?: string; deletedAtIso?: string|null; }

export interface UserService {
 logoutUser(request: UserLogoutRequestDto, signal?: AbortSignal, requestTimeoutMs?: number): Promise<UserSubmitActionResponseDto>;
 queryAvailableDemoUsers(role?: UserSelectorRole): Promise<UserSelectorListItemDto[]>;
 queryUserById(userId?: string, requestTimeoutMs?: number): Promise<UserByIdQueryResponse>;
 checkLocationEligibility(coordinates?: LocationCoordinates | null): Promise<UserLocationEligibilityResponseDto>;
 saveUserProfile(user: UserDto, requestTimeoutMs?: number): Promise<UserDto | null>;
 deleteUser(request: UserDeleteRequestDto, signal?: AbortSignal, requestTimeoutMs?: number): Promise<UserSubmitActionResponseDto>;
}
