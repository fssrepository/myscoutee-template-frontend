import { Injectable, inject } from '@angular/core';

import { SeedHelpCenterRepository } from '../../repositories/help/help-center-seed.repository';

@Injectable({
  providedIn: 'root'
})
export class SeedStaticContentService {
  private readonly helpCenter = inject(SeedHelpCenterRepository);

  async ensureReady(): Promise<void> {
    await this.helpCenter.seedDefaults();
  }
}
