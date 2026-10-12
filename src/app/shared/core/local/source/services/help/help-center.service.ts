import type {
  HelpCenterAuditRecord,
  HelpCenterGuideFieldRecord,
  HelpCenterRevisionRecord,
  HelpCenterTable,
  PrivacyConsentLocalRecord
} from '../../entity/content/content.entity';
import { Injectable, inject } from '@angular/core';

import { AppUtils } from '../../../../base/app-utils';
import { APP_STATIC_DATA } from '../../../../common/app-static-data';
import type {
  GuideDocumentKind as HelpCenterDocumentKind,
  GuideRevision as HelpCenterRevisionDto,
  GuideSection as HelpCenterSectionDto
} from '@fssrepository/myscoutee-components';
import type { HelpCenterAuditEntryDto, HelpCenterStateDto, PrivacyConsentDto, PrivacyConsentSaveRequestDto } from '../../../../contracts';
import { RouteDelayService } from '../../../../base/services/platform/route-delay.service';
import { HelpCenterContentBuilder } from '../../../../base/builders/help/help-center-content.builder';

import { LocalHelpCenterRepository } from '../../repositories/help/help-center.repository';
import { LocalHelpCenterMapper } from '../../mappers/help/help-center.mapper';

const SEEDED_HELP_IMAGE_REF_PREFIX = 'help-seeded-image:';
const LAZY_HELP_IMAGE_PLACEHOLDER_URL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

@Injectable({ providedIn: 'root' })
export class LocalHelpCenterService {
  private readonly helpCenterRepository = inject(LocalHelpCenterRepository);

  private readonly routeDelay = inject(RouteDelayService);

  async loadState(kind: HelpCenterDocumentKind = 'help', lang?: string | null, contextKey?: string | null, groupId: string | null = null): Promise<HelpCenterStateDto> {
    const [state] = await Promise.all([
      this.readState(kind, lang, contextKey, groupId),
      this.routeDelay.waitForRouteDelay(`/${this.normalizeKind(kind)}/active`)
    ]);
    return state;
  }

  async readState(kind: HelpCenterDocumentKind = 'help', lang?: string | null, contextKey?: string | null, groupId: string | null = null): Promise<HelpCenterStateDto> {
    const documentKind = this.normalizeKind(kind);
    const language = this.requestContentLang(lang);
    const context = this.normalizeContextKey(documentKind, contextKey, false);
    await this.helpCenterRepository.whenReady();
    const table = this.table(documentKind === 'privacy' ? null : groupId);
    this.assertBootstrappedState(table, documentKind, language, context);
    return this.stateFromTable(table, documentKind, language, context);
  }

  async loadPrivacyConsent(
    userId: string,
    revisionId: string,
    _revisionVersion?: number
  ): Promise<PrivacyConsentDto | null> {
    await this.helpCenterRepository.whenReady();
    const groupId = null;
    const normalizedUserId = this.helpCenterRepository.accountForUser(userId);
    const normalizedRevisionId = this.nonEmptyText(revisionId, '');
    if (!normalizedUserId || !normalizedRevisionId) {
      return null;
    }
    const table = this.table(groupId);
    const consentId = this.privacyConsentRecordId(normalizedUserId, normalizedRevisionId);
    const consent = table.privacyConsentsById?.[consentId] ?? null;
    if (consent) {
      return LocalHelpCenterMapper.toDto(consent);
    }
    return this.latestPrivacyConsentForUser(table, normalizedUserId);
  }

  async savePrivacyConsent(request: PrivacyConsentSaveRequestDto): Promise<PrivacyConsentDto> {
    await this.helpCenterRepository.whenReady();
    const groupId = null;
    const userId = this.helpCenterRepository.accountForUser(request?.userId ?? '');
    const revisionId = this.nonEmptyText(request?.revisionId, '');
    if (!userId || !revisionId) {
      throw new Error('A user and privacy revision are required to save consent.');
    }
    const table = this.table(groupId);
    const revision = table.revisionsById[revisionId];
    const revisionDto = revision ? LocalHelpCenterMapper.toDto(revision) : null;
    if (!revisionDto || this.revisionKind(revisionDto) !== 'privacy') {
      throw new Error('Privacy revision not found.');
    }
    const id = this.privacyConsentRecordId(userId, revisionId);
    const current = table.privacyConsentsById?.[id] ?? null;
    const nowIso = new Date().toISOString();
    const revisionVersion = Math.max(1, Math.trunc(Number(revisionDto.version || request?.revisionVersion) || 1));
    const currentRevisionVersion = Math.max(0, Math.trunc(Number(current?.revisionVersion) || 0));
    const consent = LocalHelpCenterMapper.toRecord({
      id,
      userId,
      revisionId,
      revisionVersion,
      approvedOptionalSectionIds: this.approvedOptionalSectionIds(request?.approvedOptionalSectionIds, revisionDto),
      acceptedAtIso: currentRevisionVersion >= revisionVersion && current?.acceptedAtIso ? current.acceptedAtIso : nowIso,
      updatedAtIso: nowIso,
      source: this.normalizeConsentSource(request?.source)
    });
    this.helpCenterRepository.updateTable(currentTable => {
      const consentsById = {
        ...(currentTable.privacyConsentsById ?? {}),
        [id]: consent
      };
      return {
        ...currentTable,
        privacyConsentsById: consentsById,
        privacyConsentIds: [...new Set([...(currentTable.privacyConsentIds ?? []), id])]
      };
    }, groupId);
    await Promise.all([
      this.helpCenterRepository.flushToIndexedDb(),
      this.routeDelay.waitForRouteDelay('/privacy/consents')
    ]);
    return LocalHelpCenterMapper.toDto(consent);
  }

  private assertBootstrappedState(
    table: HelpCenterTable,
    kind: HelpCenterDocumentKind,
    lang: string,
    contextKey: string | null
  ): void {
    if (kind === 'explanation' && !contextKey) {
      return;
    }
    const revisions = this.revisionsForKind(table, kind, lang, contextKey);
    const activeRevisionId = this.activeRevisionId(table, kind, lang, contextKey);
    if (revisions.length > 0 && activeRevisionId && revisions.some(revision => revision.id === activeRevisionId)) {
      return;
    }
    throw new Error(`Demo ${this.documentLabel(kind).toLowerCase()} content is not bootstrapped.`);
  }

  private table(groupId: string | null = null): HelpCenterTable {
    return this.helpCenterRepository.readTable(groupId);
  }

  private privacyConsentRecordId(userId: string, revisionId: string): string {
    return `${userId.trim()}::${revisionId.trim()}`;
  }

  private latestPrivacyConsentForUser(table: HelpCenterTable, userId: string): PrivacyConsentDto | null {
    const consentsById = table.privacyConsentsById ?? {};
    const latest = Object.values(consentsById)
      .filter(consent => consent?.userId?.trim() === userId)
      .sort((left, right) => this.privacyConsentSortValue(right) - this.privacyConsentSortValue(left))[0] ?? null;
    return latest ? LocalHelpCenterMapper.toDto(latest) : null;
  }

  private privacyConsentSortValue(consent: PrivacyConsentDto | PrivacyConsentLocalRecord): number {
    const updatedAtMs = Date.parse(consent.updatedAtIso || consent.acceptedAtIso || '');
    if (Number.isFinite(updatedAtMs)) {
      return updatedAtMs;
    }
    return Math.max(0, Math.trunc(Number(consent.revisionVersion) || 0));
  }

  private approvedOptionalSectionIds(
    approvedSectionIds: readonly string[] | null | undefined,
    revision: HelpCenterRevisionDto
  ): string[] {
    const optionalSectionIds = new Set(
      this.normalizeSections(revision.sections, 'privacy')
        .filter(section => section.optional === true)
        .map(section => section.id)
    );
    return Array.from(new Set(
      (Array.isArray(approvedSectionIds) ? approvedSectionIds : [])
        .map(sectionId => `${sectionId ?? ''}`.trim())
        .filter(sectionId => optionalSectionIds.has(sectionId))
    )).sort();
  }

  private stateFromTable(table: HelpCenterTable, kind: HelpCenterDocumentKind, lang = 'en', contextKey?: string | null, admin = false): HelpCenterStateDto {
    const language = this.normalizeLang(lang);
    const context = this.normalizeContextKey(kind, contextKey, false);
    const activeRevisionId = this.activeRevisionId(table, kind, language, context);
    const activeRecord = activeRevisionId ? table.revisionsById[activeRevisionId] : undefined;
    const source = !admin && kind === 'explanation'
      ? (activeRecord ? [LocalHelpCenterMapper.toDto(activeRecord)] : [])
      : this.revisionsForState(table, kind, language, context);
    const revisions = source
      .filter(revision => !admin || !revision.isSystem)
      .map(revision => this.cloneRevision(revision, kind))
      .sort((left, right) => right.version - left.version);
    const activeRevision = activeRevisionId
      ? revisions.find(revision => revision.id === activeRevisionId) ?? null
      : null;
    const auditTrail = table.auditIds
      .map(id => table.auditById[id])
      .filter((entry): entry is HelpCenterAuditRecord => Boolean(entry))
      .map(entry => LocalHelpCenterMapper.toDto(entry))
      .filter(entry => this.auditKind(entry) === kind)
      .filter(entry => !admin || !table.revisionsById[entry.revisionId ?? '']?.isSystem)
      .map(entry => {
        const entryLang = this.normalizeLang(entry.lang);
        return { ...entry, documentKind: kind, lang: entryLang, languageLabel: this.languageLabel(entryLang) };
      })
      .sort((left, right) => right.createdAtIso.localeCompare(left.createdAtIso));
    return {
      activeRevision: activeRevision ? this.cloneRevision(activeRevision, kind) : null,
      revisions,
      auditTrail: auditTrail.filter(entry => this.normalizeLang(entry.lang) === language),
      availableLanguages: this.availableLanguages(),
      guideFields: kind === 'explanation' && context
        ? (table.guideFieldIds ?? [])
          .map(id => table.guideFieldsById?.[id])
          .filter((field): field is HelpCenterGuideFieldRecord => field !== undefined && field.screenKey === context)
          .map(field => ({ ...field }))
        : []
    };
  }

  private revisionsForState(table: HelpCenterTable, kind: HelpCenterDocumentKind, lang = 'en', contextKey?: string | null): HelpCenterRevisionDto[] {
    const language = this.normalizeLang(lang);
    if (kind === 'explanation' && this.normalizeContextKey(kind, contextKey, false)) {
      return this.revisionsForKind(table, kind, language, null);
    }
    return this.revisionsForKind(table, kind, language, contextKey);
  }

  private activeRevisionId(table: HelpCenterTable, kind: HelpCenterDocumentKind, lang = 'en', contextKey?: string | null): string | null {
    const language = this.normalizeLang(lang);
    const context = this.normalizeContextKey(kind, contextKey, false);
    if (kind === 'explanation' && !context) {
      return null;
    }
    const activeKey = this.activeRevisionKey(kind, language, context);
    if (table.activeRevisionIdsByKind && activeKey in table.activeRevisionIdsByKind) {
      return table.activeRevisionIdsByKind[activeKey] ?? null;
    }
    if (language === 'en' && table.activeRevisionIdsByKind && kind in table.activeRevisionIdsByKind) {
      return table.activeRevisionIdsByKind[kind] ?? null;
    }
    if (kind === 'help' && language === 'en') {
      return table.activeRevisionId ?? null;
    }
    return this.revisionsForKind(table, kind, language, context).find(revision => revision.active)?.id ?? null;
  }

  private revisionsForKind(table: HelpCenterTable, kind: HelpCenterDocumentKind, lang = 'en', contextKey?: string | null): HelpCenterRevisionDto[] {
    const language = this.normalizeLang(lang);
    const context = this.normalizeContextKey(kind, contextKey, false);
    return table.revisionIds
      .map(id => table.revisionsById[id])
      .filter((revision): revision is HelpCenterRevisionRecord => Boolean(revision))
      .map(revision => LocalHelpCenterMapper.toDto(revision))
      .filter(revision => this.revisionKind(revision) === kind && this.revisionLang(revision) === language)
      .filter(revision => kind !== 'explanation' || !context || this.revisionContextKey(revision) === context);
  }

  private normalizeSections(sections: readonly HelpCenterSectionDto[], kind: HelpCenterDocumentKind): HelpCenterSectionDto[] {
    const seenIds = new Set<string>();
    return (Array.isArray(sections) ? sections : [])
      .map((section, index) => this.normalizeSection(section, index, seenIds, kind))
      .filter((section): section is HelpCenterSectionDto => section !== null);
  }

  private normalizeSection(
    section: HelpCenterSectionDto,
    index: number,
    seenIds: Set<string>,
    kind: HelpCenterDocumentKind
  ): HelpCenterSectionDto | null {
    const title = this.nonEmptyText(section?.title, `${this.documentLabel(kind)} section ${index + 1}`);
    const baseId = this.slugify(section?.id || title) || `section-${index + 1}`;
    let id = baseId;
    let duplicateIndex = 2;
    while (seenIds.has(id)) {
      id = `${baseId}-${duplicateIndex++}`;
    }
    seenIds.add(id);
    const contentHtml = this.normalizeHtml(section?.contentHtml || this.htmlFromLegacySection(section));
    if (!contentHtml.trim()) {
      return null;
    }
    return {
      id,
      icon: this.nonEmptyText(section?.icon, this.defaultSectionIcon(kind)),
      title,
      blurb: this.nonEmptyText(section?.blurb, ''),
      contentHtml,
      imageUrls: this.normalizeImageUrls(section?.imageUrls),
      panelSpan: this.normalizePanelSpan(section?.panelSpan),
      optional: kind === 'privacy' && section?.optional === true,
      guideStepId: kind === 'explanation' ? (section?.guideStepId?.trim() || null) : null
    };
  }

  private normalizePanelSpan(value: string | null | undefined): HelpCenterSectionDto['panelSpan'] {
    const normalized = `${value ?? ''}`.trim().toLowerCase();
    if (normalized === 'span-1' || normalized === 'compact' || normalized === 'single' || normalized === 'one' || normalized === '1') {
      return 'span-1';
    }
    if (normalized === 'span-2' || normalized === 'wide' || normalized === 'double' || normalized === 'two' || normalized === '2') {
      return 'span-2';
    }
    if (normalized === 'span-3' || normalized === 'full' || normalized === 'row' || normalized === 'all' || normalized === '3') {
      return 'span-3';
    }
    return undefined;
  }

  private normalizeImageUrls(imageUrls: readonly string[] | null | undefined, limit = 8): string[] {
    const result: string[] = [];
    const seen = new Set<string>();
    for (const imageUrl of imageUrls ?? []) {
      const normalized = `${imageUrl ?? ''}`.trim();
      if (!normalized || seen.has(normalized)) {
        continue;
      }
      seen.add(normalized);
      result.push(normalized);
      if (result.length >= limit) {
        break;
      }
    }
    return result;
  }

  private htmlFromLegacySection(section: HelpCenterSectionDto | null | undefined): string {
    const details = Array.isArray(section?.details) ? section.details : [];
    const points = Array.isArray(section?.points) ? section.points : [];
    return [
      section?.blurb ? `<p><strong>${this.escapeHtml(section.blurb)}</strong></p>` : '',
      ...details.map(detail => `<p>${this.escapeHtml(detail)}</p>`),
      points.length
        ? `<ul>${points.map(point => `<li>${this.escapeHtml(point)}</li>`).join('')}</ul>`
        : ''
    ].join('');
  }

  private normalizeHtml(value: string): string {
    return this.normalizeSeededImageRefsInHtml(`${value ?? ''}`)
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
      .replace(/\s(?:href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\1/gi, '')
      .trim();
  }

  private normalizeSeededImageRefsInHtml(value: string | null | undefined): string {
    return `${value ?? ''}`.replace(/<img\b[^>]*>/gi, tag => this.normalizeSeededImageTag(tag));
  }

  private normalizeSeededImageTag(tag: string): string {
    const srcMatch = /\ssrc\s*=\s*(["'])(.*?)\1/i.exec(tag);
    const dataLazyMatch = /\sdata-lazy-src\s*=\s*(["'])(.*?)\1/i.exec(tag);
    const lazySource = dataLazyMatch && this.isSeededHelpImageRef(dataLazyMatch[2])
      ? dataLazyMatch[2].trim()
      : srcMatch && this.isSeededHelpImageRef(srcMatch[2])
        ? srcMatch[2].trim()
        : this.seededHelpImageRefFromPlaceholder(srcMatch?.[2]);
    if (!lazySource) {
      return tag;
    }
    const nextSourceAttrs = ` src="${this.escapeHtml(this.lazyImagePlaceholderSrc(lazySource))}"`;
    const withoutLazySource = tag
      .replace(/\sdata-lazy-src\s*=\s*(["']).*?\1/gi, '')
      .replace(/\sdata-i18n-svg\s*=\s*(["']).*?\1/gi, '');
    if (!srcMatch) {
      return withoutLazySource.replace(/<img\b/i, `<img${nextSourceAttrs}`);
    }
    return withoutLazySource.replace(/\ssrc\s*=\s*(["']).*?\1/i, nextSourceAttrs);
  }

  private isSeededHelpImageRef(value: string | null | undefined): boolean {
    return `${value ?? ''}`.trim().startsWith(SEEDED_HELP_IMAGE_REF_PREFIX);
  }

  private lazyImagePlaceholderSrc(imageUrl: string): string {
    return `${LAZY_HELP_IMAGE_PLACEHOLDER_URL}#lazy-src=${encodeURIComponent(imageUrl)}`;
  }

  private seededHelpImageRefFromPlaceholder(value: string | null | undefined): string {
    const src = `${value ?? ''}`.trim();
    if (!src.startsWith(LAZY_HELP_IMAGE_PLACEHOLDER_URL)) {
      return '';
    }
    const marker = '#lazy-src=';
    const markerIndex = src.indexOf(marker);
    if (markerIndex < 0) {
      return '';
    }
    try {
      const decoded = decodeURIComponent(src.slice(markerIndex + marker.length)).trim();
      return this.isSeededHelpImageRef(decoded) ? decoded : '';
    } catch {
      return '';
    }
  }

  private escapeHtml(value: string): string {
    return `${value ?? ''}`
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private cloneRevision(revision: HelpCenterRevisionDto, kind = this.revisionKind(revision)): HelpCenterRevisionDto {
    const lang = this.revisionLang(revision);
    return {
      ...revision,
      documentKind: kind,
      contextKey: this.revisionContextKey(revision),
      lang,
      languageLabel: this.languageLabel(lang),
      description: this.nonEmptyText(revision.description, this.defaultDescription(kind, lang)),
      headerColor: this.normalizeHeaderColor(revision.headerColor),
      presentation: kind === 'explanation' && revision.presentation === 'tour' ? 'tour' : 'document',
      sections: this.normalizeSections(revision.sections, kind)
    };
  }

  private defaultDescription(kind: HelpCenterDocumentKind, lang = 'en'): string {
    return HelpCenterContentBuilder.defaultDescription(kind, lang);
  }

  private normalizeHeaderColor(value: string | null | undefined): HelpCenterRevisionDto['headerColor'] {
    return AppUtils.enumValue(value, APP_STATIC_DATA.helpCenterHeaderColors, 'amber');
  }

  private documentLabel(kind: HelpCenterDocumentKind): string {
    return HelpCenterContentBuilder.documentLabel(kind);
  }

  private defaultSectionIcon(kind: HelpCenterDocumentKind): string {
    return HelpCenterContentBuilder.defaultSectionIcon(kind);
  }

  private revisionKind(revision: HelpCenterRevisionDto | null | undefined): HelpCenterDocumentKind {
    return this.normalizeKind(revision?.documentKind);
  }

  private revisionLang(revision: HelpCenterRevisionDto | null | undefined): string {
    return this.normalizeLang(revision?.lang);
  }

  private auditKind(entry: HelpCenterAuditEntryDto | null | undefined): HelpCenterDocumentKind {
    return this.normalizeKind(entry?.documentKind);
  }

  private normalizeKind(kind: string | null | undefined): HelpCenterDocumentKind {
    if (kind === 'privacy' || kind === 'terms' || kind === 'explanation') {
      return kind;
    }
    return 'help';
  }

  private normalizeContextKey(kind: HelpCenterDocumentKind, contextKey: string | null | undefined, required: boolean): string | null {
    if (kind !== 'explanation') {
      return null;
    }
    const normalized = `${contextKey ?? ''}`.trim();
    const match = APP_STATIC_DATA.explainableSurfaces.find(surface => surface.enabled && surface.key === normalized);
    if (match) {
      return match.key;
    }
    if (required) {
      throw new Error('A canonical explanation surface is required.');
    }
    return null;
  }

  private revisionContextKey(revision: HelpCenterRevisionDto | null | undefined): string | null {
    return this.normalizeContextKey(this.revisionKind(revision), revision?.contextKey, false);
  }

  private normalizeLang(lang: string | null | undefined): string {
    const normalized = `${lang ?? ''}`.trim().toLowerCase().split('-')[0];
    return normalized === 'hu' ? 'hu' : 'en';
  }

  private requestContentLang(lang: string | null | undefined): string {
    const explicit = this.supportedContentLang(lang);
    if (explicit) {
      return explicit;
    }
    return this.supportedContentLang(this.browserLanguage()) || 'en';
  }

  private browserLanguage(): string {
    const languages = this.browserLanguages()
      .map(value => this.normalizeRequestLanguage(value))
      .filter(Boolean);
    return languages.find(lang => lang !== 'en') ?? languages[0] ?? 'en';
  }

  private browserLanguages(): string[] {
    if (typeof navigator === 'undefined') {
      return [];
    }
    return Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];
  }

  private supportedContentLang(lang: string | null | undefined): string | null {
    const requested = this.normalizeRequestLanguage(lang);
    return this.availableLanguages().some(language => language.lang === requested) ? requested : null;
  }

  private normalizeRequestLanguage(lang: string | null | undefined): string {
    const normalized = `${lang ?? ''}`
      .trim()
      .toLowerCase()
      .split(',')[0]
      .split(';')[0]
      .split('-')[0]
      .replace(/[^a-z]/g, '');
    return normalized;
  }

  private languageLabel(lang: string | null | undefined): string {
    return this.normalizeLang(lang) === 'hu' ? 'Magyar' : 'English';
  }

  private availableLanguages(): Array<{ lang: string; label: string }> {
    return APP_STATIC_DATA.contentLanguages.map(language => ({
      lang: this.normalizeLang(language.lang),
      label: language.label
    }));
  }

  private activeRevisionKey(kind: HelpCenterDocumentKind, lang: string, contextKey?: string | null): string {
    const context = this.normalizeContextKey(kind, contextKey, false);
    return context ? `${kind}:${this.normalizeLang(lang)}:${context}` : `${kind}:${this.normalizeLang(lang)}`;
  }

  private normalizeConsentSource(source: string | null | undefined): PrivacyConsentDto['source'] {
    return source === 'entry' ? 'entry' : 'settings';
  }

  private nonEmptyText(value: string | null | undefined, fallback: string): string {
    const normalized = `${value ?? ''}`.trim();
    return normalized || fallback;
  }

  private slugify(value: string): string {
    return `${value ?? ''}`
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
