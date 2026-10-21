import { HTTP_ADAPTER, LOCAL_ADAPTER } from '../../adapter-loaders';
import { AdapterProxyService } from '../platform/adapter-proxy.service';
import { Injectable, inject } from '@angular/core';
import { defer, from, map } from 'rxjs';
import type { SmartListLoadPage } from '@fssrepository/myscoutee-components';
import type { SampleCardDto } from '../../../contracts/showcase/showcase.interface';
import { BaseRouteModeService } from '../platform/base-route-mode.service';
@Injectable({ providedIn: 'root' })
export class ShowcaseService extends BaseRouteModeService {
  private readonly transportAdapters = inject(AdapterProxyService);

  private readonly local = this.transportAdapters.reference(LOCAL_ADAPTER.SHOWCASE);
  private readonly http = this.transportAdapters.reference(HTTP_ADAPTER.SHOWCASE);
  readonly loadPage: SmartListLoadPage<SampleCardDto> = query => defer(() => {
    const identity = this.sessionService.identity();
    return from(this.resolveRouteService('/showcase/cards', this.local, this.http).queryPage(query.page, query.pageSize)).pipe(map(result => {
      if (identity !== this.sessionService.identity()) throw new Error('Session changed while loading cards.');
      return result;
    }));
  });
}
