import { Injectable, inject } from '@angular/core';
import { defer, from, map } from 'rxjs';
import type { SmartListLoadPage } from '@fssrepository/myscoutee-components';
import type { SampleCardDto } from '../../../contracts/showcase/showcase.interface';
import { LocalShowcaseService } from '../../../local/source/services/showcase/showcase.service';
import { HttpShowcaseService } from '../../../http/services/showcase/showcase.service';
import { BaseRouteModeService } from '../platform/base-route-mode.service';
@Injectable({ providedIn: 'root' })
export class ShowcaseService extends BaseRouteModeService {
  private readonly local = inject(LocalShowcaseService);
  private readonly http = inject(HttpShowcaseService);
  readonly loadPage: SmartListLoadPage<SampleCardDto> = query => defer(() => {
    const identity = this.sessionService.identity();
    return from(this.resolveRouteService('/showcase/cards', this.local, this.http).queryPage(query.page, query.pageSize)).pipe(map(result => {
      if (identity !== this.sessionService.identity()) throw new Error('Session changed while loading cards.');
      return result;
    }));
  });
}
