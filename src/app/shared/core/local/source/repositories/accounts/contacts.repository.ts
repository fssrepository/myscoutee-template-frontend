import { AppUtils } from '../../../../base/app-utils';
import { Injectable, inject } from '@angular/core';
import { LocalMemoryDb } from '../../../../common/app.db';
import { CONTACTS_TABLE_NAME } from '../../entity/accounts/profile.entity';
@Injectable({providedIn:'root'})
export class LocalContactsRepository {
 private readonly memoryDb = inject(LocalMemoryDb);
 isChatApproved(first: string, second: string): boolean {
    const record = this.memoryDb.read()[CONTACTS_TABLE_NAME].chatAccessById?.[this.pairId(first, second)];
    return record?.status === 'approved';
  }

private pairId(first: string, second: string): string {
    const [left, right] = [first, second].sort(AppUtils.compareCodeUnits);
    return `${left.length}:${left}${right}`;
  }
}
