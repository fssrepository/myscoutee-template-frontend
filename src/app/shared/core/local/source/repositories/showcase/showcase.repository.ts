import { Injectable, inject } from '@angular/core';
import { LocalMemoryDb } from '../../../../common/app.db';
import type { SampleCardDto } from '../../../../contracts/showcase/showcase.interface';
import type { PageResult } from '@fssrepository/myscoutee-components';
@Injectable({ providedIn: 'root' })
export class LocalShowcaseRepository {
  private readonly db = inject(LocalMemoryDb);
  async queryPage(page: number, pageSize: number): Promise<PageResult<SampleCardDto>> {
    await this.db.whenReady();
    const table = this.db.read().sampleCards;
    const ids = [...table.ids].sort();
    return { items: ids.slice(page * pageSize, (page + 1) * pageSize).map(id => structuredClone(table.byId[id])), total: ids.length };
  }
}
