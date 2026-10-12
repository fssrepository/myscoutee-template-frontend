import { Injectable, inject } from '@angular/core';
import { LocalShowcaseRepository } from '../../repositories/showcase/showcase.repository';
import { RouteDelayService } from '../../../../base/services/platform/route-delay.service';
@Injectable({ providedIn: 'root' })
export class LocalShowcaseService {
  private readonly repository = inject(LocalShowcaseRepository);
  private readonly delay = inject(RouteDelayService);
  async queryPage(page: number, pageSize: number) {
    const [result] = await Promise.all([this.repository.queryPage(page, pageSize), this.delay.waitForRouteDelay('/showcase/cards')]);
    return result;
  }
}
