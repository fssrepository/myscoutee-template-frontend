import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SmartListComponent, InfoCardComponent, UiDateUtils,
  type SmartListConfig, type InfoCardData } from '@fssrepository/myscoutee-components';
import { ShowcaseService } from '../../../shared/core/base/services/showcase/showcase.service';
import { AppRuntimeStore } from '../../../shared/ui/context/stores/app/app-runtime.store';
import type { SampleCardDto } from '../../../shared/core/contracts/showcase/showcase.interface';

// The retained Activity / Events views use the shared SmartList calendar.
export const SHOWCASE_VIEW_OPTIONS = [
  { id: 'month', label: 'Month', icon: 'calendar_month', palette: 'gold' as const },
  { id: 'week', label: 'Week', icon: 'date_range', palette: 'green' as const },
  { id: 'day', label: 'Day', icon: 'today', palette: 'blue' as const }
];
@Component({
  selector: 'app-showcase', standalone: true,
  imports: [SmartListComponent, InfoCardComponent],
  templateUrl: './showcase.component.html', styleUrl: './showcase.component.scss'
})
export class ShowcaseComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly query = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  private readonly runtime = inject(AppRuntimeStore);
  protected readonly service = inject(ShowcaseService);
  protected readonly view = computed(() => {
    const view = this.query().get('view');
    return view === 'week' || view === 'month' ? view : 'day';
  });
  protected readonly config: SmartListConfig<SampleCardDto> = {
    pageSize: 10, initialPageSize: 20, defaultView: 'day',
    listLayout: 'card-grid', desktopColumns: 3, mobileColumns: 1,
    snapMode: 'mandatory', scrollPaddingTop: '2.6rem', footerSpacerHeight: null,
    headerProgress: { enabled: true, state: () => this.runtime.isDataSourceAvailable() ? 'active' : 'inactive' },
    pagination: { mode: 'scroll' },
    views: [
      { key: 'day', label: 'Day', mode: 'list', pageSize: 10 },
      { key: 'week', label: 'Week', mode: 'week', pageSize: 50 },
      { key: 'month', label: 'Month', mode: 'month', pageSize: 50 }
    ],
    cacheable: true,
    groupBy: item => UiDateUtils.smartListDayLabel(new Date(item.dateIso)),
    calendar: {
      weekdayLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      weekStartHour: 0, weekEndHour: 23, anchorRadius: 2,
      resolveDateRange: item => {
        const date = new Date(item.dateIso);
        return Number.isNaN(date.getTime()) ? null : { start: date, end: date };
      },
      badgeLabel: item => item.title
    },
    showGroupMarker: ({ groupIndex, scrollable }) => groupIndex > 0 || scrollable,
    trackBy: (_index, item) => item.id,
    emptyLabel: 'showcase.empty', emptyDescription: 'showcase.empty.description', emptyStickyLabel: 'No items'
  };
  protected card(item: SampleCardDto): InfoCardData {
    return { id: item.id, title: item.title, description: item.description, imageUrl: item.imageUrl, i18nIgnoreContent: true, hasMenuOptions: false };
  }
}
