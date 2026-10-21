import { HTTP_ADAPTER, LOCAL_ADAPTER, type AdapterInstance } from '../../adapter-loaders';
import { AdapterProxyService } from '../platform/adapter-proxy.service';
import { Injectable, inject } from '@angular/core';
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
  private readonly transportAdapters = inject(AdapterProxyService);

  private readonly localMediaService = this.transportAdapters.reference(LOCAL_ADAPTER.MEDIA);
  private readonly httpMediaService = this.transportAdapters.reference(HTTP_ADAPTER.MEDIA);

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

  private mediaService(route: string): AdapterInstance<typeof LOCAL_ADAPTER.MEDIA> | AdapterInstance<typeof HTTP_ADAPTER.MEDIA> {
    return this.resolveRouteService(route, this.localMediaService, this.httpMediaService);
  }
}
