import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { PageResult } from '@fssrepository/myscoutee-components';
import type { SampleCardDto } from '../../../contracts/showcase/showcase.interface';
import { RouteDelayService } from '../../../base/services/platform/route-delay.service';
import { environment } from '../../../../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class HttpShowcaseService {
  private readonly http = inject(HttpClient);
  private readonly delay = inject(RouteDelayService);
  queryPage(page: number, pageSize: number): Promise<PageResult<SampleCardDto>> {
    return this.delay.withRequestTimeout('/showcase/cards', firstValueFrom(this.http.get<PageResult<SampleCardDto>>(
      `${environment.apiBaseUrl}/showcase/cards`, { params: { page, pageSize } }
    )), 'Unable to load cards.');
  }
}
