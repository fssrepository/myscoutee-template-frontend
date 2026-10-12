import { Injectable, inject } from '@angular/core';

import { LocalMediaService } from '../../../local/source/services/media/media.service';
import { HttpMediaService } from '../../../http/services/media/media.service';
import { BaseRouteModeService } from '../platform/base-route-mode.service';

const MEDIA_IMAGE_UPLOAD_ROUTE = '/media/images';
const MEDIA_IMAGE_IMPORT_ROUTE = '/media/images/import';

export interface MediaImageUploadResult {
  uploaded: boolean;
  imageUrl: string | null;
  imageSet?: MediaImageSet | null;
}

export interface MediaImageSet {
  originalUrl: string | null;
  smallUrl: string | null;
  mediumUrl: string | null;
  largeUrl: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class MediaService extends BaseRouteModeService {
  private readonly localMediaService = inject(LocalMediaService);
  private readonly httpMediaService = inject(HttpMediaService);

  async uploadImage(ownerId: string, entityId: string, file: File): Promise<MediaImageUploadResult> {
    return this.mediaService(MEDIA_IMAGE_UPLOAD_ROUTE).uploadImage(ownerId, entityId, file);
  }

  async importImage(
    ownerId: string,
    entityId: string,
    imageUrl: string
  ): Promise<MediaImageUploadResult> {
    return this.mediaService(MEDIA_IMAGE_IMPORT_ROUTE).importImage(ownerId, entityId, imageUrl);
  }

  private mediaService(route: string): LocalMediaService | HttpMediaService {
    return this.resolveRouteService(route, this.localMediaService, this.httpMediaService);
  }
}
