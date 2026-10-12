import { describe, expect, it } from 'vitest';
import type { NotificationDto } from '../../../core/contracts/notifications/notification.interface';
import { NotificationSingleRowConverter } from './notification-single-row.converter';

const notification = (sourceType: string, payload: Record<string, string>): NotificationDto => ({
  id: 'notice', recipientUserId: 'member', kind: 'notice', category: 'app-admin',
  title: 'Notice', message: 'Saved notification', createdAtIso: '2026-10-12T00:00:00Z',
  sourceType, payload, revision: 1
});

describe('Template notification destinations', () => {
  it.each(['reports', 'feedback', 'stats'])('retains a %s notification without a link to an omitted screen', roleTarget => {
    const item = notification('app-admin', { roleTarget });
    const row = new NotificationSingleRowConverter().convert(item);
    expect(row.id).toBe(item.id);
    expect(row.menuActions).toEqual(['markNotificationRead']);
    expect(NotificationSingleRowConverter.roleTargetPath(item)).toBeNull();
  });
  it('preserves operator update and member chat destinations', () => {
    expect(NotificationSingleRowConverter.roleTargetPath(notification('operator', { roleTarget: 'updates' })))
      .toBe('/operator?notificationTarget=updates');
    expect(NotificationSingleRowConverter.targetActionId(notification('chat', { chatId: 'conversation' })))
      .toBe('openNotificationChat');
  });
});
