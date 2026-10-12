import { Injectable, inject } from '@angular/core';

import { LocalMemoryDb } from '../../../../common/app.db';
import type { OperatorDeploymentStateRecord } from '../../entity/operator/operator.entity';
import type { DeploymentConfigurationDto } from '../../../../contracts/platform/deployment-configuration.interface';

@Injectable({
  providedIn: 'root'
})
export class LocalDeploymentConfigurationRepository {
  private readonly memoryDb = inject(LocalMemoryDb);
  private hydrationPromise: Promise<void> | null = null;
  private hydrated = false;
  private cachedRecord: OperatorDeploymentStateRecord | null = null;

  async whenReady(): Promise<void> {
    if (this.hydrated) {
      return;
    }
    if (!this.hydrationPromise) {
      this.hydrationPromise = this.hydrate();
    }
    await this.hydrationPromise;
  }

  async read(): Promise<OperatorDeploymentStateRecord | null> {
    await this.whenReady();
    return this.cloneRecord(this.cachedRecord);
  }

  async readPublicConfiguration(): Promise<DeploymentConfigurationDto> {
    await this.whenReady();
    if (this.cachedRecord) {
      const configuration = this.cachedRecord.configuration;
      return structuredClone({
        ...configuration.branding,
        firebaseMessagingConfigured: configuration.firebase.messagingCredentialConfigured,
        socialLinks: configuration.socialLinks,
        privacyContact: configuration.privacyContact
      });
    }
    // The public local site has its own small catalog before any operator demo exists.
    // Reading it does not create an operator, ledger or registry record.
    const { default: configurationData } = await import('../../../seed/data/deployment-configuration.json');
    return structuredClone(configurationData);
  }

  async write(record: OperatorDeploymentStateRecord): Promise<void> {
    await this.whenReady();
    const saved = this.cloneRecord(record);
    if (!saved) {
      return;
    }
    this.cachedRecord = saved;
    await this.memoryDb.writeIndexedDbTableEntry(
      'deploymentConfiguration',
      this.cloneRecord(saved)
    );
  }

  async clear(): Promise<void> {
    await this.whenReady();
    this.cachedRecord = null;
    await this.memoryDb.deleteIndexedDbTableEntry('deploymentConfiguration');
  }

  private async hydrate(): Promise<void> {
    await this.memoryDb.whenReady();
    this.cachedRecord = this.cloneRecord(
      await this.memoryDb.readIndexedDbTableEntry<OperatorDeploymentStateRecord>(
        'deploymentConfiguration'
      )
    );
    this.hydrated = true;
  }

  private cloneRecord(
    record: OperatorDeploymentStateRecord | null | undefined
  ): OperatorDeploymentStateRecord | null {
    return record ? structuredClone(record) : null;
  }
}
