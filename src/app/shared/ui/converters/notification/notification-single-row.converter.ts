import type {
  NotificationCategory,
  NotificationDto
} from '../../../core/contracts/notifications/notification.interface';
import {
  type SingleRowData,
  type SingleRowSurfaceTone,
  type ConverterOptionsArg,
  type UiConverter
} from '@fssrepository/myscoutee-components';

export interface NotificationSingleRowConverterOptions {
  locale?: string | null;
  progressRing?: boolean;
  translate?: (key: string, fallback?: string | null) => string;
}

export class NotificationSingleRowConverter implements UiConverter<
  NotificationDto,
  SingleRowData<NotificationDto>,
  NotificationSingleRowConverterOptions | undefined
> {
  convert(
    notification: NotificationDto,
    ...optionsArg: ConverterOptionsArg<NotificationSingleRowConverterOptions | undefined>
  ): SingleRowData<NotificationDto> {
    const options = optionsArg[0] ?? {};
    const read = Boolean(`${notification.readAtIso ?? ''}`.trim());
    const securityAlert = notification.kind === 'security-login';
    const senderName = securityAlert ? '' : `${notification.senderName ?? ''}`.trim();
    const systemAvatar = securityAlert;
    const sourceLabel = securityAlert ? 'Templates' : this.sourceLabel(notification.category, options);
    const workspaceName = `${notification.payload?.['workspaceGroupName'] ?? ''}`.trim();
    const sourceContext = workspaceName ? `${sourceLabel} · ${workspaceName}` : sourceLabel;
    const timestamp = this.timestampLabel(notification.createdAtIso, options.locale);
    const occurrenceCount = Math.max(1, Math.trunc(Number(notification.occurrenceCount ?? 1)) || 1);
    const statusBadgeKey = `${notification.payload?.['notification_status_badge_key'] ?? ''}`.trim();
    const statusBadgeFallback = `${notification.payload?.['notification_status_badge_fallback'] ?? ''}`.trim();
    const statusBadgeLabel = statusBadgeKey && options.translate
      ? options.translate(statusBadgeKey, statusBadgeFallback)
      : statusBadgeFallback;
    const targetAction = NotificationSingleRowConverter.targetActionId(notification);
    return {
      id: notification.id,
      title: this.title(notification, options),
      subtitle: senderName ? `${senderName} · ${sourceContext}` : sourceContext,
      detail: this.message(notification, options),
      dateIso: notification.createdAtIso,
      avatarUrl: systemAvatar ? null : `${notification.senderAvatarUrl ?? ''}`.trim() || null,
      avatarInitials: !systemAvatar && senderName ? this.initials(senderName) : null,
      avatarAriaLabel: senderName || sourceLabel,
      avatarToneClass: systemAvatar ? 'notification-system-avatar' : null,
      icon: securityAlert ? 'warning_amber' : senderName ? null : this.categoryIcon(notification.category),
      surfaceTone: this.surfaceTone(notification, read),
      toneClass: `notification-row notification-row--${notification.category}`,
      badges: [
        ...(statusBadgeLabel ? [{
          label: statusBadgeLabel,
          ariaLabel: statusBadgeLabel,
          title: statusBadgeLabel,
          tone: this.payloadTone(notification.payload?.['notification_status_badge_tone']) ?? 'muted',
          position: 'inline' as const
        }] : []),
        ...(occurrenceCount > 1 ? [{
          label: `${occurrenceCount}`,
          icon: 'repeat',
          ariaLabel: this.translation(
            options,
            'notification.matches.count',
            `${occurrenceCount} matching notifications`,
            { count: `${occurrenceCount}` }
          ),
          title: this.translation(
            options,
            'notification.matches.count',
            `${occurrenceCount} matching notifications`,
            { count: `${occurrenceCount}` }
          ),
          tone: 'warning' as const,
          position: 'inline' as const
        }] : []),
        {
          label: timestamp,
          icon: 'schedule',
          ariaLabel: timestamp,
          title: timestamp,
          tone: read ? 'muted' : this.badgeTone(notification),
          position: 'top-right'
        },
        ...(read ? [{
          label: this.translation(options, 'notification.status.read', 'Read'),
          icon: 'done_all',
          tone: 'muted' as const,
          position: 'inline' as const
        }] : [])
      ],
      menuActions: [
        ...(!read ? ['markNotificationRead'] : []),
        ...(targetAction ? [targetAction] : [])
      ],
      progressRing: options.progressRing === true,
      eagerDetail: {
        ...notification,
        payload: notification.payload ? { ...notification.payload } : null
      }
    };
  }
  static targetActionId(notification: NotificationDto): string | null {
    if (NotificationSingleRowConverter.roleTargetPath(notification)) return 'openNotificationRoleTarget';
    return notification.sourceType === 'chat' && notification.payload?.['chatId'] ? 'openNotificationChat' : null;
  }

  static roleTargetPath(notification: NotificationDto): string | null {
    if (notification.sourceType === 'operator' && notification.kind === 'node-member-joined'
      && notification.actionPath === '/operator') return '/operator';
    if (notification.sourceType === 'security' && notification.kind === 'security-login'
      && notification.actionPath === '/operator') {
      return notification.actionPath;
    }
    const target = notification.payload?.['roleTarget'];
    if (notification.sourceType === 'operator' && target === 'updates') return '/operator?notificationTarget=updates';
    return null;
  }

  private message(
    notification: NotificationDto,
    options: NotificationSingleRowConverterOptions
  ): string {
    const key = `${notification.payload?.['notification_message_key']
      ?? this.notificationMessageKey(notification)}`.trim();
    const translated = key && options.translate
      ? options.translate(key, notification.message)
      : notification.message;
    return this.compactMessage(
      notification,
      this.interpolatePayload(translated, notification.payload)
    );
  }

  private compactMessage(notification: NotificationDto, fallback: string): string {
    return this.withoutRepeatedSender(fallback, notification.senderName);
  }

  private withoutRepeatedSender(value: string, senderName?: string | null): string {
    const message = `${value ?? ''}`.trim();
    const sender = `${senderName ?? ''}`.trim();
    if (!sender || !message.toLocaleLowerCase().startsWith(`${sender.toLocaleLowerCase()} `)) {
      return message;
    }
    const remainder = message.slice(sender.length).trimStart();
    return remainder ? `${remainder.charAt(0).toLocaleUpperCase()}${remainder.slice(1)}` : message;
  }

  private title(
    notification: NotificationDto,
    options: NotificationSingleRowConverterOptions
  ): string {
    const key = `${notification.payload?.['notification_title_key']
      ?? this.notificationKey(notification.kind, 'title')}`.trim();
    const translated = key && options.translate
      ? options.translate(key, notification.title)
      : notification.title;
    return this.interpolatePayload(translated, notification.payload);
  }

  private interpolatePayload(
    value: string,
    payload: NotificationDto['payload']
  ): string {
    return `${value ?? ''}`.replace(/\{([A-Za-z0-9_.-]+)\}/g, (match, key: string) => {
      const replacement = payload?.[key];
      return replacement == null ? match : `${replacement}`;
    });
  }

  private notificationKey(kind: string, field: 'title' | 'message'): string {
    const normalizedKind = `${kind ?? ''}`
      .trim()
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return normalizedKind ? `notification.kind.${normalizedKind}.${field}` : '';
  }
  private notificationMessageKey(notification: NotificationDto): string { return this.notificationKey(notification.kind, 'message'); }

  private translation(
    options: NotificationSingleRowConverterOptions,
    key: string,
    fallback: string,
    payload?: Record<string, string>
  ): string {
    const translated = options.translate ? options.translate(key, fallback) : fallback;
    return this.interpolatePayload(translated, payload ?? null);
  }

  private surfaceTone(notification: NotificationDto, read: boolean): SingleRowSurfaceTone {
    if (read) {
      return 'muted';
    }
    const contextualTone = this.contextualTone(notification);
    if (contextualTone) {
      return contextualTone;
    }
    switch (notification.category) {
      case 'chat':
      case 'event':
        return 'info';
      case 'event-admin':
        return 'accent';
      case 'asset':
        return 'warning';
      case 'app-admin':
        return 'danger';
      case 'scheduled':
        return 'success';
      default:
        return 'neutral';
    }
  }

  private badgeTone(notification: NotificationDto): SingleRowSurfaceTone {
    const contextualTone = this.contextualTone(notification);
    if (contextualTone) {
      return contextualTone;
    }
    switch (notification.category) {
      case 'chat':
      case 'event':
        return 'info';
      case 'event-admin':
        return 'accent';
      case 'asset':
        return 'warning';
      case 'app-admin':
        return 'danger';
      case 'scheduled':
        return 'success';
      default:
        return 'neutral';
    }
  }

  private contextualTone(notification: NotificationDto): SingleRowSurfaceTone | null {
    return this.payloadTone(notification.payload?.['notification_tone']);
  }

  private payloadTone(value: string | undefined): SingleRowSurfaceTone | null {
    const requestedTone = `${value ?? ''}`.trim();
    switch (requestedTone) {
      case 'info':
      case 'accent':
      case 'success':
      case 'warning':
      case 'danger':
        return requestedTone;
      default:
        return null;
    }
  }

  private categoryIcon(category: NotificationCategory): string {
    switch (category) {
      case 'user':
        return 'person';
      case 'chat':
        return 'chat';
      case 'event':
        return 'event';
      case 'event-admin':
        return 'admin_panel_settings';
      case 'asset':
        return 'inventory_2';
      case 'app-admin':
        return 'verified_user';
      case 'scheduled':
        return 'schedule';
    }
  }

  private sourceLabel(
    category: NotificationCategory,
    options: NotificationSingleRowConverterOptions
  ): string {
    switch (category) {
      case 'user':
        return this.translation(options, 'notification.source.member', 'Member');
      case 'chat':
        return this.translation(options, 'notification.source.chat', 'Chat');
      case 'event':
        return this.translation(options, 'notification.source.event', 'Event');
      case 'event-admin':
        return this.translation(options, 'notification.source.event.admin', 'Event admin');
      case 'asset':
        return this.translation(options, 'notification.source.asset', 'Asset');
      case 'app-admin':
        return 'Templates';
      case 'scheduled':
        return this.translation(options, 'notification.source.scheduled', 'Scheduled');
    }
  }

  private timestampLabel(value: string, locale?: string | null): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value.trim();
    }
    try {
      return new Intl.DateTimeFormat(locale?.trim() || undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }).format(date);
    } catch {
      return date.toLocaleString();
    }
  }

  private initials(value: string): string {
    const initials = value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
    return initials || 'N';
  }
}

export const notificationSingleRowConverter = new NotificationSingleRowConverter();
