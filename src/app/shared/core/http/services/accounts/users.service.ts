
import type { UserLogoutRequestDto, UserDeleteRequestDto, UserSubmitActionResponseDto } from '../../../contracts/accounts/user.interface';
import type { UserRealtimeLongPollResponseDto } from '../../../contracts/accounts/user.interface';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import type { UserService, UserDto, UserSelectorRole, UserSelectorListItemDto, UserByIdQueryResponse, LocationCoordinates, UserLocationEligibilityResponseDto } from '../../../contracts/accounts/user.interface';
import { environment } from '../../../../../../environments/environment';
import { RouteDelayService } from '../../../base/services/platform/route-delay.service';
@Injectable({ providedIn: 'root' })
export class HttpUsersService implements UserService {
  private static readonly DEMO_USERS_ROUTE = '/auth/demo-users';

  private static readonly USER_BY_ID_ROUTE = '/auth/me';

  private readonly http = inject(HttpClient);

  private readonly routeDelay = inject(RouteDelayService);

  private readonly apiBaseUrl = environment.apiBaseUrl ?? '/api';

  async queryAvailableDemoUsers(selectorRole: UserSelectorRole = 'member'): Promise<UserSelectorListItemDto[]> {
    type HttpDemoUserListEntry = Partial<UserDto> & Partial<UserSelectorListItemDto> & {
      gender?: string | null;
    };
    const response = await this.routeDelay.withRequestTimeout(
      HttpUsersService.DEMO_USERS_ROUTE,
      this.http
        .get<HttpDemoUserListEntry[] | null>(`${this.apiBaseUrl}/auth/demo-users`, {
          params: {
            role: selectorRole
          }
        })
        .toPromise(),
      'Users request timeout.'
    );
    if (!Array.isArray(response)) {
      return [];
    }
    return response
      .map(user => this.toDemoUserListItem(user))
      .filter((user): user is UserSelectorListItemDto => user !== null);
  }

  async checkLocationEligibility(coordinates?: LocationCoordinates | null): Promise<UserLocationEligibilityResponseDto> {
    const hasCoordinates = !!coordinates
      && Number.isFinite(Number(coordinates.latitude))
      && Number.isFinite(Number(coordinates.longitude));
    const response = await this.http
      .get<UserLocationEligibilityResponseDto>(`${this.apiBaseUrl}/auth/eligibility`, {
        params: hasCoordinates
          ? {
              latitude: `${Number(coordinates?.latitude)}`,
              longitude: `${Number(coordinates?.longitude)}`
            }
          : {}
      })
      .toPromise();
    return {
      eligible: response?.eligible === true,
      partitionKey: typeof response?.partitionKey === 'string' ? response.partitionKey : null,
      message: typeof response?.message === 'string' ? response.message : null,
      securityGateEnabled: response?.securityGateEnabled === true,
      locationRequired: response?.locationRequired === true
    };
  }

  async saveUserProfile(user: UserDto, requestTimeoutMs?: number): Promise<UserDto | null> {
    if (!user?.id?.trim()) {
      return null;
    }
    const response = await this.routeDelay.withRequestTimeout(
      HttpUsersService.USER_BY_ID_ROUTE,
      this.http
        .post<UserDto | null>(`${this.apiBaseUrl}/auth/me/profile`, user)
        .toPromise(),
      'Profile save request timeout.',
      requestTimeoutMs
    );
    if (!response) {
      return user;
    }
    return response;
  }

  private toDemoUserListItem(user: Partial<UserDto> & Partial<UserSelectorListItemDto> & { gender?: string | null }): UserSelectorListItemDto | null {
    const id = `${user.id ?? ''}`.trim();
    if (!id) {
      return null;
    }
    const normalizedGender = `${user.gender ?? ''}`.trim().toLowerCase() === 'man' ? 'man' : 'woman';
    return {
      id,
      locationCoordinates: user.locationCoordinates ?? null,
      locationRequired: user.locationRequired === true,
      name: `${user.name ?? ''}`.trim(),
      city: `${user.city ?? ''}`.trim(),
      initials: `${user.initials ?? ''}`.trim(),
      avatarUrl: `${user.avatarUrl ?? ''}`.trim(),
      gender: normalizedGender,
      profileFormVersion: user.profileFormVersion === undefined || user.profileFormVersion === null
        ? undefined
        : Math.max(0, Math.trunc(Number(user.profileFormVersion) || 0)),
      status: `${user.status ?? ''}`.trim(),
      deletedAtIso: typeof user.deletedAtIso === 'string' ? user.deletedAtIso : null
    };
  }
 async queryUserById(userId?: string, requestTimeoutMs?: number): Promise<UserByIdQueryResponse> {
  const normalizedUserId = userId?.trim() ?? '';
  const user = await this.routeDelay.withRequestTimeout(HttpUsersService.USER_BY_ID_ROUTE, this.http.get<UserDto | null>(
   this.apiBaseUrl + HttpUsersService.USER_BY_ID_ROUTE, { params: normalizedUserId ? { userId: normalizedUserId } : {} }
  ).toPromise(), 'User details request timeout.', requestTimeoutMs);
  return { user: user ?? null };
 }

  private static readonly USER_DELETE_ROUTE = '/auth/me/delete';
  async queryUserRealtimeLongPoll(userId: string, cursor: string | null = null, signal?: AbortSignal): Promise<UserRealtimeLongPollResponseDto | null> {
    const normalized = userId.trim();
    if (!normalized) return null;
    const route = '/auth/me/realtime/long-poll';
    const response = await this.routeDelay.withRequestTimeout(route,
      this.postAbortable<UserRealtimeLongPollResponseDto>(this.apiBaseUrl + route, { userId: normalized, cursor }, signal),
      'User realtime request timeout.');
    return response?.counters ? response : null;
  }


  async deleteUser(
    request: UserDeleteRequestDto,
    signal?: AbortSignal,
    requestTimeoutMs?: number
  ): Promise<UserSubmitActionResponseDto> {
    try {
      const response = await this.routeDelay.withRequestTimeout(
        HttpUsersService.USER_DELETE_ROUTE,
        this.postAbortable<UserSubmitActionResponseDto>(
          `${this.apiBaseUrl}${HttpUsersService.USER_DELETE_ROUTE}`,
          request,
          signal
        ),
        'Delete account request timeout.',
        requestTimeoutMs
      );
      if (!response) {
        return { submitted: true, message: null };
      }
      return {
        submitted: response.submitted !== false,
        message: typeof response.message === 'string' ? response.message : null
      };
    } catch (error) {
      if (this.isAbortError(error)) {
        throw error;
      }
      if (this.isTimeoutError(error, 'Delete account request timeout.')) {
        throw error;
      }
      return {
        submitted: false,
        message: 'Unable to delete account.'
      };
    }
  }


  private postAbortable<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T | null> {
    return new Promise<T | null>((resolve, reject) => {
      if (signal?.aborted) {
        reject(this.createAbortError());
        return;
      }
      let emitted = false;
      const subscription = this.http.post<T | null>(url, body).subscribe({
        next: response => {
          emitted = true;
          cleanup();
          resolve(response ?? null);
        },
        error: error => {
          cleanup();
          reject(error);
        },
        complete: () => {
          if (emitted) {
            return;
          }
          cleanup();
          resolve(null);
        }
      });
      const onAbort = () => {
        cleanup();
        subscription.unsubscribe();
        reject(this.createAbortError());
      };
      const cleanup = () => {
        signal?.removeEventListener('abort', onAbort);
      };
      signal?.addEventListener('abort', onAbort, { once: true });
    });
  }


  private createAbortError(): Error {
    const error = new Error('Request aborted.');
    error.name = 'AbortError';
    return error;
  }


  private isAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === 'AbortError';
  }


  private isTimeoutError(error: unknown, message: string): boolean {
    return error instanceof Error && error.message === message;
  }
  private static readonly USER_LOGOUT_ROUTE = '/auth/me/logout';
  async logoutUser(
    request: UserLogoutRequestDto,
    signal?: AbortSignal,
    requestTimeoutMs?: number
  ): Promise<UserSubmitActionResponseDto> {
    try {
      const response = await this.routeDelay.withRequestTimeout(
        HttpUsersService.USER_LOGOUT_ROUTE,
        this.postAbortable<UserSubmitActionResponseDto>(
          `${this.apiBaseUrl}${HttpUsersService.USER_LOGOUT_ROUTE}`,
          request,
          signal
        ),
        'Logout request timeout.',
        requestTimeoutMs
      );
      if (!response) {
        return { submitted: true, message: null };
      }
      return {
        submitted: response.submitted !== false,
        message: typeof response.message === 'string' ? response.message : null
      };
    } catch (error) {
      if (this.isAbortError(error)) {
        throw error;
      }
      if (this.isTimeoutError(error, 'Logout request timeout.')) {
        throw error;
      }
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // The session is already unauthorized. Let SessionService complete
        // local sign-out and clear the current user's private cache.
        return { submitted: true, message: null };
      }
      return {
        submitted: false,
        message: 'Unable to log out.'
      };
    }
  }
}
