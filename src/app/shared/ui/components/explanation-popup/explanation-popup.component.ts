import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import {
  ExplanationGuideService,
  type GuideRevision as HelpCenterRevisionDto,
  type GuideSection as HelpCenterSectionDto,
  I18nPipe,
  LazyBgImageDirective,
  IndicatorComponent,
  PopupComponent,
  type PopupModel
} from '@fssrepository/myscoutee-components';


import { ExplanationGuideOverlayComponent } from './explanation-guide-overlay.component';


type ExplanationSectionLayout = 'span-1' | 'span-2' | 'span-3';

@Component({
  selector: 'app-explanation-popup',
  standalone: true,
  imports: [CommonModule, MatIconModule, LazyBgImageDirective, IndicatorComponent, I18nPipe, PopupComponent, ExplanationGuideOverlayComponent],
  templateUrl: './explanation-popup.component.html',
  styleUrl: './explanation-popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplanationPopupComponent {
  protected readonly guide = inject(ExplanationGuideService);
  protected readonly popupOpen = this.guide.popupOpen;
  protected readonly loading = this.guide.loading;
  protected readonly activeRevision = this.guide.visibleRevision;
  private readonly lazyImagePlaceholderUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

  protected explanationPopupModel(revision: HelpCenterRevisionDto): PopupModel {
    return {
      title: revision.title,
      translateTitle: false,
      ariaLabel: revision.title,
      size: 'wide',
      height: 'full',
      headerLayout: 'document',
      headerPalette: revision.headerColor ?? 'slate',
      headerTitleTone: 'neutral',
      bodyLayout: 'fill',
      backdropTone: 'dim',
      onClose: event => this.close(event)
    };
  }

  protected loadingExplanationPopupModel(): PopupModel {
    return {
      ariaLabel: 'Loading explanation',
      size: 'wide',
      height: 'full',
      headerLayout: 'document',
      headerPalette: 'slate',
      headerTitleTone: 'neutral',
      bodyLayout: 'fill',
      backdropTone: 'dim',
      onClose: event => this.close(event)
    };
  }

  protected explanationPopupZIndex(): number {
    return 23000;
  }

  protected shouldShowGeneratedVisual(section: HelpCenterSectionDto): boolean {
    return !/<img[\s>]/i.test(this.sectionContentHtml(section));
  }

  protected sectionContentHtml(section: HelpCenterSectionDto): string {
    const contentHtml = `${section.contentHtml ?? ''}`.trim();
    if (/<img[\s>]/i.test(contentHtml)) {
      return contentHtml;
    }
    const imageUrl = this.primarySectionImageUrl(section);
    if (!imageUrl) {
      return contentHtml;
    }
    const seededFigure = `<figure class="explanation-seeded-visual lazy-image-frame-loading"><img class="lazy-image-loading" src="${this.escapeHtmlAttribute(this.lazyImagePlaceholderSrc(imageUrl))}" alt="${this.escapeHtmlAttribute(section.title ?? '')}"></figure>`;
    return `${contentHtml}${contentHtml ? '' : ''}${seededFigure}`;
  }

  protected sectionLayoutClass(section: HelpCenterSectionDto): string | null {
    const layout = this.sectionLayout(section);
    return layout ? `explanation-popup__item--${layout}` : null;
  }

  private sectionLayout(section: HelpCenterSectionDto): ExplanationSectionLayout | null {
    const panelSpan = this.normalizeSectionLayout(section.panelSpan);
    if (panelSpan) {
      return panelSpan;
    }
    const marker = this.sectionLayoutMarker(section.contentHtml ?? '');
    if (marker) {
      return marker;
    }
    return null;
  }

  private sectionLayoutMarker(contentHtml: string): ExplanationSectionLayout | null {
    const commentMarker = /<!--\s*(?:panel|layout|section|width)\s*:\s*([a-z0-9_-]+)\s*-->/i.exec(contentHtml)?.[1];
    const attributeMarker = /\b(?:data-panel|data-layout|data-section|data-width|data-panel-width)\s*=\s*["']\s*([a-z0-9_-]+)\s*["']/i.exec(contentHtml)?.[1];
    const classMarker = /\b(?:help|explanation|section|panel)-(?:panel|section|layout)--([a-z0-9_-]+)\b/i.exec(contentHtml)?.[1];
    return this.normalizeSectionLayout(commentMarker ?? attributeMarker ?? classMarker);
  }

  private normalizeSectionLayout(value: string | null | undefined): ExplanationSectionLayout | null {
    const normalized = `${value ?? ''}`.trim().toLowerCase();
    if (!normalized) {
      return null;
    }
    if (normalized === 'span-1' || normalized === 'compact' || normalized === 'single' || normalized === 'one' || normalized === '1') {
      return 'span-1';
    }
    if (normalized === 'span-2' || normalized === 'wide' || normalized === 'double' || normalized === 'two' || normalized === '2') {
      return 'span-2';
    }
    if (normalized === 'span-3' || normalized === 'full' || normalized === 'row' || normalized === 'all' || normalized === '3') {
      return 'span-3';
    }
    return null;
  }

  private primarySectionImageUrl(section: HelpCenterSectionDto): string {
    return `${section.imageUrls?.[0] ?? ''}`.trim();
  }

  private lazyImagePlaceholderSrc(imageUrl: string): string {
    return `${this.lazyImagePlaceholderUrl}#lazy-src=${encodeURIComponent(imageUrl)}`;
  }

  private escapeHtmlAttribute(value: string): string {
    return `${value ?? ''}`
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  protected close(event?: Event): void {
    event?.stopPropagation();
    this.guide.closePopup();
  }
}
