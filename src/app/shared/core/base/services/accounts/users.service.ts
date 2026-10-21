import { HTTP_ADAPTER, LOCAL_ADAPTER } from '../../adapter-loaders';
import { AdapterProxyService } from '../platform/adapter-proxy.service';

import type { BootstrapProcessState } from '../platform/bootstrap.service';
import { Injectable, inject } from '@angular/core';
import type { UserDto, UserSelectorRole, LocationCoordinates, UserLogoutRequestDto, UserSubmitActionResponseDto } from '../../../contracts/accounts/user.interface';
import { BaseRouteModeService } from '../platform/base-route-mode.service';
import { RouteDelayService } from '../platform/route-delay.service';
import { UserProfileStore } from '../../../../ui/context/stores/profile/user-profile.store';
import { AppRuntimeStore } from '../../../../ui/context/stores/app/app-runtime.store';
export const USER_BY_ID_LOAD_CONTEXT_KEY = 'user-by-id';
export const USER_PROFILE_SAVE_CONTEXT_KEY = 'user-profile-save';
export const USER_LOGOUT_CONTEXT_KEY = 'user-logout';
@Injectable({ providedIn: 'root' })
export class UsersService extends BaseRouteModeService {
  private readonly transportAdapters = inject(AdapterProxyService);

 private readonly local = this.transportAdapters.reference(LOCAL_ADAPTER.USERS);
 private readonly http = this.transportAdapters.reference(HTTP_ADAPTER.USERS);
 private readonly profiles = inject(UserProfileStore);
 private readonly routeDelay = inject(RouteDelayService);
 realtimePollIntervalMs(): number { return this.routeDelay.resolveIntervalMs('/auth/me/realtime/long-poll', 30_000); }
 async pollUserRealtimeSnapshot(userId: string, cursor: string | null = null, signal?: AbortSignal) {
  return this.userService.queryUserRealtimeLongPoll(userId, cursor, signal);
 }
 private loadedSessionIdentity: string | null = null;
 peekCurrentUser(): UserDto | null {
  return this.loadedSessionIdentity === this.sessionService.identity() ? this.profiles.activeUserProfile() : null;
 }
 peekCachedUserById(userId: string): UserDto | null {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) return null;
  return this.profiles.getUserProfile(normalizedUserId)
   ?? (this.localModeEnabled ? this.local.peekCachedUserById(normalizedUserId) : this.http.peekCachedUserById(normalizedUserId));
 }
 private readonly runtime = inject(AppRuntimeStore);
 async prepareDemoUserSession(userId: string, onProgress?: (state: BootstrapProcessState) => void): Promise<void> {
  if (this.localModeEnabled) await this.local.prepareUserSession(userId, onProgress);
 }
 get localModeEnabled(): boolean { return this.isLocalRouteEnabled('/auth/me'); }
 loadAvailableDemoUsers(role: UserSelectorRole = 'member') { return this.resolveRouteService('/auth/demo-users', this.local, this.http).queryAvailableDemoUsers(role); }
 checkLocationEligibility(coordinates?: LocationCoordinates | null) { return this.userService.checkLocationEligibility(coordinates); }
 private get userService() { return this.resolveRouteService('/auth/me', this.local, this.http); }
 async loadUserById(userId?: string): Promise<UserDto | null> {
  const session = this.sessionService.identity();
  this.runtime.setStatus(USER_BY_ID_LOAD_CONTEXT_KEY, 'loading');
  try {
   const response = await this.userService.queryUserById(userId);
   if (session !== this.sessionService.identity()) return null;
   if (!response.user) throw new Error('User details not found.');
   this.profiles.setActiveUserProfile(response.user);
   this.loadedSessionIdentity = session;
   this.runtime.setStatus(USER_BY_ID_LOAD_CONTEXT_KEY, 'success');
   return response.user;
  } catch (error) {
   if (session === this.sessionService.identity()) this.runtime.setStatus(USER_BY_ID_LOAD_CONTEXT_KEY, 'error', 'Unable to load user details.');
   throw error;
  }
 }
 async saveUserProfile(user: UserDto): Promise<UserDto | null> {
  const session = this.sessionService.identity();
  this.runtime.setStatus(USER_PROFILE_SAVE_CONTEXT_KEY, 'loading');
  try {
   const result = await this.userService.saveUserProfile(user);
   if (session !== this.sessionService.identity()) return null;
   if (!result) throw new Error('Profile save returned no user.');
   this.profiles.setUserProfile(result);
   this.runtime.setStatus(USER_PROFILE_SAVE_CONTEXT_KEY, 'success');
   return result;
  } catch (error) {
   if (session === this.sessionService.identity()) this.runtime.setStatus(USER_PROFILE_SAVE_CONTEXT_KEY, 'error', 'Unable to save profile.');
   throw error;
  }
 }
 async deleteUser(userId: string): Promise<void> {
  const response = await this.resolveRouteService('/auth/me/delete', this.local, this.http).deleteUser({ userId: userId.trim() });
  if (!response.submitted) throw new Error(response.message || 'Unable to delete account.');
 }
  async logoutUser(
    userId: string,
    requestTimeoutMs?: number,
    signal?: AbortSignal
  ): Promise<UserSubmitActionResponseDto> {
    const request: UserLogoutRequestDto = {
      userId: userId.trim()
    };
    return this.submitUserAction(
      USER_LOGOUT_CONTEXT_KEY,
      (requestSignal, timeoutMs) => this.userService.logoutUser(request, requestSignal, timeoutMs),
      requestTimeoutMs,
      'Logout request timeout.',
      'Unable to log out.',
      signal
    );
  }
  private async submitUserAction(
    contextKey: string,
    requestFactory: (
      signal: AbortSignal,
      requestTimeoutMs?: number
    ) => Promise<UserSubmitActionResponseDto>,
    requestTimeoutMs: number | undefined,
    timeoutMessage: string,
    fallbackErrorMessage: string,
    signal?: AbortSignal
  ): Promise<UserSubmitActionResponseDto> {
    if (signal?.aborted) {
      this.runtime.resetLoadingState(contextKey);
      return {
        submitted: false,
        message: null
      };
    }

    const requestAbortController = new AbortController();
    const unbindAbort = this.bindAbort(signal, requestAbortController);
    this.runtime.setStatus(contextKey, 'loading');

    try {
      const response = await requestFactory(requestAbortController.signal, requestTimeoutMs);

      if (!response.submitted) {
        this.runtime.setStatus(contextKey, 'error', response.message ?? fallbackErrorMessage);
        return {
          submitted: false,
          message: response.message ?? fallbackErrorMessage
        };
      }

      this.runtime.setStatus(contextKey, 'success');
      return response;
    } catch (error) {
      if (this.isAbortError(error)) {
        this.runtime.resetLoadingState(contextKey);
        return {
          submitted: false,
          message: null
        };
      }

      if (this.isTimeoutError(error, timeoutMessage)) {
        this.runtime.setStatus(contextKey, 'timeout', timeoutMessage);
        return {
          submitted: false,
          message: timeoutMessage
        };
      }

      this.runtime.setStatus(contextKey, 'error', fallbackErrorMessage);
      return {
        submitted: false,
        message: fallbackErrorMessage
      };
    } finally {
      unbindAbort();
    }
  }
  private isAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === 'AbortError';
  }
  private isTimeoutError(error: unknown, message: string): boolean {
    return error instanceof Error && error.message === message;
  }
  private bindAbort(signal: AbortSignal | undefined, abortController: AbortController): () => void {
    if (!signal) {
      return () => undefined;
    }
    if (signal.aborted) {
      abortController.abort();
      return () => undefined;
    }
    const onAbort = () => abortController.abort();
    signal.addEventListener('abort', onAbort, { once: true });
    return () => signal.removeEventListener('abort', onAbort);
  }
}
