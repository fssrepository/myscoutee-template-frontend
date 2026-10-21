import {
  UiDateUtils,
  type ListQuery,
  DialogStore,
  ExplanationGuideService,
  type AppMenuItem,
  type AppMenuItemSelectEvent,
  type AppMenuTrigger,
  PopupComponent,
  type PopupMenuSelectEvent,
  type PopupModel,
  SmartListComponent,
  type SmartListConfig,
  type SmartListLoadPage,
  type SmartListPollDeltaSnapshot,
  SingleRowComponent,
  type SingleRowData
} from '@fssrepository/myscoutee-components';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { backendUnavailable } from '../../../core/common/backend-connectivity';
import { AppRuntimeStore } from '../../context/stores/app/app-runtime.store';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject
} from '@angular/core';
import { from } from 'rxjs';

import { I18nService } from '../../../core/base/services/localization/i18n.service';
import type {
  NotificationBucket,
  NotificationDto,
  NotificationListFilters,
  NotificationSyncRequestDto
} from '../../../core/contracts/notifications/notification.interface';

import {
  NotificationSingleRowConverter
} from '../../converters/notification/notification-single-row.converter';
import { NotificationCenterStore } from '../../context/stores/notification/notification-center.store';

interface NotificationRowMenuContext extends Record<string, unknown> {
  notification: NotificationDto;
  action?: { id?: string };
}

type NotificationHeaderMenuContext =
  | { action: 'set-bucket'; bucket: NotificationBucket }
  | { action: 'toggle-muted' }
  | { action: 'set-workspace'; workspace: string };

@Component({
  selector: 'app-notification-center-popup',
  standalone: true,
  imports: [
    PopupComponent,
    SmartListComponent,
    SingleRowComponent
  ],
  templateUrl: './notification-center-popup.component.html',
  styleUrl: './notification-center-popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationCenterPopupComponent implements OnDestroy {
  private readonly router = inject(Router);
  @ViewChild('notificationsSmartList')
  private notificationsSmartList?: SmartListComponent<NotificationDto, NotificationListFilters>;

  protected readonly store = inject(NotificationCenterStore);
  private readonly runtimeStore = inject(AppRuntimeStore);
  private readonly preferenceUnavailable = computed(() => !this.runtimeStore.isDataSourceAvailable()
    || (environment.activitiesDataSource === 'http' && backendUnavailable()));
  private readonly dialogStore = inject(DialogStore);
  private readonly i18n = inject(I18nService);
  private readonly explanationGuide = inject(ExplanationGuideService);
  private readonly converter = new NotificationSingleRowConverter();
  private unregisterExplanationContext: (() => void) | null = null;

  constructor() {
    effect(() => {
      if (this.store.isOpen()) {
        this.unregisterExplanationContext ??= this.explanationGuide.registerContext('notifications');
      } else {
        this.unregisterExplanationContext?.();
        this.unregisterExplanationContext = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.unregisterExplanationContext?.();
    this.unregisterExplanationContext = null;
  }

  protected readonly query = computed<Partial<ListQuery<NotificationListFilters>>>(() => ({
    page: 0,
    pageSize: 20,
    sort: 'createdAt',
    direction: 'desc',
    filters: { bucket: this.store.bucket(), workspace: this.store.workspace() }
  }));

  private readonly bucketMenuItems = computed<
    readonly AppMenuItem<string, NotificationHeaderMenuContext>[]
  >(() => {
    const bucket = this.store.bucket();
    const unreadCount = this.store.unreadCount();
    return (['new', 'all'] as const).map(value => ({
      id: `notification-bucket:${value}`,
      kind: 'radio',
      label: value === 'new' ? "new" : "all",
      icon: value === 'new' ? 'fiber_new' : 'notifications',
      palette: value === 'new' ? 'rose' : 'violet',
      surface: 'tinted',
      active: bucket === value,
      checked: bucket === value,
      showCheck: true,
      counter: value === 'new' && unreadCount > 0
        ? { value: unreadCount, max: 99 }
        : null,
      counterTone: value === 'new' ? 'alert' : 'default',
      ariaLabel: value === 'new'
        ? this.i18n.translateParams('notifications.unread.count', { count: unreadCount })
        : "notifications.filter.all.label",
      context: { action: 'set-bucket', bucket: value }
    }));
  });

  protected readonly smartListConfig: SmartListConfig<
    NotificationDto,
    NotificationListFilters
  > = {
    pageSize: 20,
    defaultView: 'list',
    defaultSort: 'createdAt',
    defaultDirection: 'desc',
    defaultFilters: { bucket: 'new' },
    emptyLabel: "notifications.empty.title",
    emptyDescription: "notifications.empty.description",
    showStickyHeader: true,
    listLayout: 'card-grid',
    desktopColumns: 1,
    snapMode: 'mandatory',
    scrollPaddingTop: '2.6rem',
    pollIntervalMs: () => this.store.pollIntervalMs(),
    pollDelta: {
      revision: item => item.revision,
      position: item => item.createdAtIso,
      load: (query, snapshot, context) => from(this.store.sync(
        this.notificationSyncRequest(query.filters?.bucket, query.pageSize, snapshot),
        context?.signal
      ))
    },
    headerProgress: {
      enabled: true,
      placement: 'inline',
      tone: 'accent'
    },
    cacheable: {
      identity: item => item.id
    },
    sortable: {
      sortKey: item => [
        -this.notificationDateMs(item.createdAtIso),
        item.id
      ]
    },
    groupBy: item => this.notificationDateGroupLabel(item.createdAtIso),
    showFirstGroupMarker: true,
    trackBy: (_index, item) => item.id
  };

  private notificationSyncRequest(
    bucket: NotificationBucket | undefined,
    pageSize: number,
    snapshot: SmartListPollDeltaSnapshot
  ): NotificationSyncRequestDto {
    return {
      bucket: bucket === 'new' ? 'new' as const : 'all' as const,
      workspace: this.store.workspace(),
      limit: Math.max(1, Math.trunc(Number(pageSize) || 20)),
      knownItems: snapshot.knownItems.map(item => ({
        id: item.id,
        revision: Math.max(1, Math.trunc(Number(item.revision) || 1))
      })),
      loadedTail: snapshot.loadedTail
        ? {
            id: snapshot.loadedTail.id,
            createdAtIso: `${snapshot.loadedTail.position}`
          }
        : null
    };
  }

  protected readonly loadPage: SmartListLoadPage<
    NotificationDto,
    NotificationListFilters
  > = (query, context) => from(this.store.queryPage(query, context?.signal));

  protected popupModel(): PopupModel<NotificationHeaderMenuContext> {
    const muted = this.store.muted();
    const unreadCount = this.store.unreadCount();
    return {
      title: "notifications",
      subtitle: unreadCount === 1 ? "notifications.badge.single" : this.i18n.translateParams('notifications.unread.count', { count: unreadCount }),
      ariaLabel: "notifications",
      closeAriaLabel: "notifications.close.aria",
      size: 'wide',
      height: 'full',
      bodyLayout: 'fill',
      headerTone: 'accent',
      headerPalette: 'violet',
      toolbarMobileAlign: 'end',
      headerControls: [
        {
          kind: 'menu',
          id: 'notification-bucket',
          trigger: this.bucketMenuTrigger(),
          items: this.bucketMenuItems(),
          panelAlign: 'end'
        },
        {
          kind: 'menu',
          id: 'notification-attention-preference',
          menuKind: 'inline',
          closeOnSelect: false,
          items: [
            {
              id: 'notification-attention-toggle',
              kind: 'toggle',
              icon: muted ? 'notifications_off' : 'notifications_active',
              disabled: this.preferenceUnavailable() || this.store.permissionActionPending(),
              progress: { state: this.store.permissionBusy() ? 'loading' : null },
              layout: 'icon',
              palette: muted ? 'slate' : 'violet',
              active: muted,
              checked: muted,
              closeOnSelect: false,
              ariaLabel: muted ? "notifications.alerts.unmute.aria" : "notifications.alerts.mute.aria",
              context: { action: 'toggle-muted' }
            }
          ]
        }
      ],
      onClose: () => this.store.close(),
      onMenuSelect: event => this.onHeaderMenuSelect(event)
    };
  }

  protected notificationRow(notification: NotificationDto): SingleRowData<NotificationDto> {
    return this.converter.convert(notification, {
      progressRing: this.store.isMarkReadPending(notification.id),
      translate: (key, fallback) => this.i18n.translate(key, fallback)
    });
  }

  private notificationDateGroupLabel(value: string): string {
    const groupDate = new Date(value);
    return Number.isNaN(groupDate.getTime())
      ? 'Date unavailable'
      : UiDateUtils.smartListDayLabel(groupDate);
  }

  private notificationDateMs(value: string): number {
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
  }

  protected rowMenuContext(notification: NotificationDto): NotificationRowMenuContext {
    return { notification };
  }

  protected onRowMenuSelect(event: AppMenuItemSelectEvent<string, unknown>): void {
    const context = event.context as NotificationRowMenuContext | undefined;
    const notification = context?.notification;
    const actionId = `${context?.action?.id ?? event.id ?? ''}`.trim();
    if (!notification) {
      return;
    }
    event.sourceEvent.preventDefault();
    event.sourceEvent.stopPropagation();
    if (actionId === 'markNotificationRead') {
      if (notification.readAtIso || this.store.isMarkReadPending(notification.id)) {
        return;
      }
      void this.markRead(notification);
      return;
    }
    if (actionId === NotificationSingleRowConverter.targetActionId(notification)) {
      void this.openNotificationTarget(notification, actionId);
    }
  }
  private async openNotificationTarget(notification: NotificationDto, actionId: string): Promise<void> {
    const path = actionId === 'openNotificationRoleTarget' ? NotificationSingleRowConverter.roleTargetPath(notification) : null;
    const chatId = notification.sourceType === 'chat' ? notification.payload?.['chatId'] : null;
    if (!path && !chatId) return;
    this.store.close();
    if (chatId) await this.router.navigate(['/home'], { queryParams: { page: 'chat', chatId } });
    else if (path) await this.router.navigateByUrl(path);
  }

  private onHeaderMenuSelect(
    event: PopupMenuSelectEvent<NotificationHeaderMenuContext>
  ): void {
    if (event.itemSelect.context?.action === 'set-bucket') {
      const bucket = event.itemSelect.context.bucket;
      if (bucket !== this.store.bucket()) {
        this.store.setBucket(bucket);
      }
      return;
    }
    if (
      event.itemSelect.id !== 'notification-attention-toggle'
      || event.itemSelect.context?.action !== 'toggle-muted'
    ) {
      return;
    }
    event.itemSelect.sourceEvent.preventDefault();
    event.itemSelect.sourceEvent.stopPropagation();
    if (this.preferenceUnavailable()) return;
    this.confirmMutedChange(!this.store.muted());
  }

  private bucketMenuTrigger(): AppMenuTrigger {
    const bucket = this.store.bucket();
    const unreadCount = this.store.unreadCount();
    return {
      label: bucket === 'new' ? "new" : "all",
      icon: bucket === 'new' ? 'fiber_new' : 'notifications',
      palette: bucket === 'new' ? 'rose' : 'violet',
      layout: 'pill',
      counter: bucket === 'new' && unreadCount > 0
        ? { value: unreadCount, max: 99 }
        : null,
      ariaLabel: bucket === 'new'
        ? this.i18n.translateParams('notifications.unread.count', { count: unreadCount })
        : "notifications.filter.all.label"
    };
  }

  private confirmMutedChange(muted: boolean): void {
    if (!this.store.activeUserId() || this.store.permissionActionPending()) return;
    this.dialogStore.open({
      title: muted ? "confirmation.mute.notification.alerts" : "confirmation.unmute.notification.alerts",
      message: muted
        ? "notifications.alerts.mute.description"
        : "notifications.alerts.unmute.description",
      confirmLabel: muted ? "notifications.alerts.mute.action" : "notifications.alerts.unmute.action",
      busyConfirmLabel: muted ? 'Muting...' : 'Unmuting...',
      confirmTone: muted ? 'warning' : 'accent',
      confirmPalette: muted ? 'warning' : 'violet',
      ringPerimeter: 112,
      onConfirm: async () => {
        await this.store.setMuted(muted);
      }
    });
  }

  private async markRead(notification: NotificationDto): Promise<void> {
    try {
      const updated = await this.store.markRead(notification.id);
      if (this.store.bucket() === 'new') {
        this.notificationsSmartList?.removeVisibleItemByIdentity(notification.id, {
          totalDelta: -1
        });
        return;
      }
      this.notificationsSmartList?.patchVisibleItem(
        item => item.id === notification.id,
        () => updated
      );
    } catch (error) {
      this.dialogStore.openInfo(
        error instanceof Error && error.message.trim()
          ? error.message
          : 'Unable to mark this notification as read.',
        {
          title: "notifications.update.error.title",
          confirmTone: 'danger'
        }
      );
    }
  }
}
