import { AppUtils } from '../../../base/app-utils';

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../../../../environments/environment';
import { RouteDelayService } from '../../../base/services/platform/route-delay.service';

const HTTP_MEDIA_IMAGE_UPLOAD_ROUTE = '/media/images';
const HTTP_MEDIA_IMAGE_IMPORT_ROUTE = '/media/images/import';

export interface HttpMediaUploadResult {
  uploaded: boolean;
  imageUrl: string | null;
  imageSet?: HttpMediaImageSet | null;
}

export interface HttpMediaImageSet {
  originalUrl: string | null;
  smallUrl: string | null;
  mediumUrl: string | null;
  largeUrl: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class HttpMediaService {
  private readonly http = inject(HttpClient);
  private readonly routeDelay = inject(RouteDelayService);
  private readonly apiBaseUrl = environment.apiBaseUrl ?? '/api';

  async uploadImage(
    ownerId: string,
    entityId: string,
    file: File
  ): Promise<HttpMediaUploadResult> {
    const normalizedOwnerId = ownerId.trim();
    const normalizedEntityId = entityId.trim();
    if (!normalizedOwnerId || !normalizedEntityId) {
      return {
        uploaded: false,
        imageUrl: null
      };
    }
    const formData = new FormData();
    formData.append('ownerId', normalizedOwnerId);
    formData.append('entityId', normalizedEntityId);
    formData.append('image', file, file.name);
    try {
      type UploadResponse = {
        uploaded?: boolean | null;
        imageUrl?: string | null;
        url?: string | null;
        imageSet?: Partial<HttpMediaImageSet> | null;
        originalUrl?: string | null;
        smallUrl?: string | null;
        mediumUrl?: string | null;
        largeUrl?: string | null;
      };
      const response = await this.routeDelay.withRequestTimeout(
        HTTP_MEDIA_IMAGE_UPLOAD_ROUTE,
        this.http
          .post<UploadResponse | null>(`${this.apiBaseUrl}/media/images`, formData)
          .toPromise(),
        'Media image upload request timeout.'
      );
      const imageUrl = this.normalizeReturnedMediaUrl(
        (typeof response?.imageUrl === 'string' && response.imageUrl.trim().length > 0
          ? response.imageUrl.trim()
          : null)
        ?? (typeof response?.url === 'string' && response.url.trim().length > 0
          ? response.url.trim()
          : null)
      );
      return {
        uploaded: response?.uploaded !== false && imageUrl !== null,
        imageUrl,
        imageSet: this.normalizeReturnedImageSet(response, imageUrl)
      };
    } catch {
      return {
        uploaded: false,
        imageUrl: null
      };
    }
  }

  async importImage(
    ownerId: string,
    entityId: string,
    imageUrl: string
  ): Promise<HttpMediaUploadResult> {
    const normalizedOwnerId = ownerId.trim();
    const normalizedEntityId = entityId.trim();
    const normalizedImageUrl = imageUrl.trim();
    if (!normalizedOwnerId || !normalizedEntityId || !normalizedImageUrl) {
      return {
        uploaded: false,
        imageUrl: null
      };
    }
    try {
      type UploadResponse = {
        uploaded?: boolean | null;
        imageUrl?: string | null;
        url?: string | null;
        imageSet?: Partial<HttpMediaImageSet> | null;
        originalUrl?: string | null;
        smallUrl?: string | null;
        mediumUrl?: string | null;
        largeUrl?: string | null;
      };
      const response = await this.routeDelay.withRequestTimeout(
        HTTP_MEDIA_IMAGE_IMPORT_ROUTE,
        this.http
          .post<UploadResponse | null>(`${this.apiBaseUrl}/media/images/import`, {
            ownerId: normalizedOwnerId,
            entityId: normalizedEntityId,
            imageUrl: normalizedImageUrl
          })
          .toPromise(),
        'Media image import request timeout.'
      );
      const storedImageUrl = this.normalizeReturnedMediaUrl(
        (typeof response?.imageUrl === 'string' && response.imageUrl.trim().length > 0
          ? response.imageUrl.trim()
          : null)
        ?? (typeof response?.url === 'string' && response.url.trim().length > 0
          ? response.url.trim()
          : null)
      );
      return {
        uploaded: response?.uploaded === true && storedImageUrl !== null,
        imageUrl: storedImageUrl,
        imageSet: this.normalizeReturnedImageSet(response, storedImageUrl)
      };
    } catch {
      return {
        uploaded: false,
        imageUrl: null
      };
    }
  }

  private normalizeReturnedMediaUrl(value: string | null): string | null {
    const url = `${value ?? ''}`.trim();
    if (!url) {
      return null;
    }
    if (/^(?:https?:|data:|blob:|indexeddb:)/i.test(url) || url.startsWith('/api/')) {
      return url;
    }
    const baseUrl = AppUtils.trimEndCharacters(this.apiBaseUrl, "/");
    if (url.startsWith('/media/')) {
      return `${baseUrl}${url}`;
    }
    if (url.startsWith('media/')) {
      return `${baseUrl}/${url}`;
    }
    return `${baseUrl}/media/public?key=${encodeURIComponent(url)}`;
  }

  private normalizeReturnedImageSet(
    response: {
      imageSet?: Partial<HttpMediaImageSet> | null;
      originalUrl?: string | null;
      smallUrl?: string | null;
      mediumUrl?: string | null;
      largeUrl?: string | null;
    } | null | undefined,
    fallbackImageUrl: string | null
  ): HttpMediaImageSet | null {
    const source: Partial<HttpMediaImageSet> = response?.imageSet ?? {};
    const originalUrl = this.normalizeReturnedMediaUrl(source.originalUrl ?? response?.originalUrl ?? fallbackImageUrl);
    const smallUrl = this.normalizeReturnedMediaUrl(source.smallUrl ?? response?.smallUrl ?? fallbackImageUrl);
    const mediumUrl = this.normalizeReturnedMediaUrl(source.mediumUrl ?? response?.mediumUrl ?? fallbackImageUrl);
    const largeUrl = this.normalizeReturnedMediaUrl(source.largeUrl ?? response?.largeUrl ?? fallbackImageUrl);
    if (!originalUrl && !smallUrl && !mediumUrl && !largeUrl) {
      return null;
    }
    return {
      originalUrl,
      smallUrl,
      mediumUrl,
      largeUrl
    };
  }
}
