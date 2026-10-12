import { Injectable } from '@angular/core';
import type { UserByIdQueryResponse } from '../../../contracts/accounts/user.interface';
import { offlineCacheUserStorageKey,APP_CACHE_KEYS } from '../../../common/storage-scope';
import { isPublicMediaUrl } from '../../../common/public-media';

@Injectable({ providedIn: 'root' })
export class OfflineCacheService {
  private readonly revokedUsers=new Set<string>();

  activateUser(userId: string): void {
    this.revokedUsers.delete(userId.trim());
  }

  async clearUser(userId: string): Promise<void> {
    const id=userId.trim();
    if(!id) return;
    // Synchronous revocation also prevents a late poll from repopulating data.
    this.revokedUsers.add(id);
    if(typeof localStorage!=='undefined') {
      for(const key of [this.userStorageKey(id)]) {
        localStorage.removeItem(key);
      }
    }
    if(typeof caches==='undefined') return;
    // App-shell caches contain static build files, not user responses.
    // Enumerate only the data caches when clearing a user's private data.
    for(const name of(await caches.keys()).filter(name =>
      name.startsWith(`${APP_CACHE_KEYS.runtimePrefix}-api-`)||name.startsWith(`${APP_CACHE_KEYS.runtimePrefix}-media-`)
    )) {
      const cache=await caches.open(name);
      const requests=await cache.keys();
      await Promise.all(requests.filter(request => {
        const path=new URL(request.url).pathname;
        return path.startsWith('/api/auth/me')
          ||(name.includes('-media-')&&!path.startsWith('/assets/')&&!isPublicMediaUrl(new URL(request.url)));
      }).map(request => cache.delete(request)));
    }
  }

  readUser(userId: string): UserByIdQueryResponse|null {
    const normalizedUserId=userId.trim();
    if(!normalizedUserId) {
      return null;
    }
    const parsed=this.readJson<UserByIdQueryResponse>(this.userStorageKey(normalizedUserId));
    return parsed? this.clone(parsed):null;
  }

  writeUser(userId: string,response: UserByIdQueryResponse): void {
    const normalizedUserId=userId.trim();
    if(!normalizedUserId||this.revokedUsers.has(normalizedUserId)||!response.user) {
      return;
    }
    this.writeJson(this.userStorageKey(normalizedUserId),this.clone(response));
  }

  private userStorageKey(userId: string): string {
    return offlineCacheUserStorageKey(userId);
  }

  private readJson<T>(key: string): T|null {
    if(typeof localStorage==='undefined') {
      return null;
    }
    try {
      const raw=localStorage.getItem(key);
      if(!raw) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  private writeJson(key: string,value: unknown): void {
    if(typeof localStorage==='undefined') {
      return;
    }
    try {
      localStorage.setItem(key,JSON.stringify(value));
    } catch {
      // Ignore storage quota failures and keep runtime state resilient.
    }
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
