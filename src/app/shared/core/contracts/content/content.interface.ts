export type HelpCenterSectionPanelSpan = 'span-1' | 'span-2' | 'span-3';
export type HelpCenterPresentation = 'document' | 'tour';
export type HelpCenterHeaderColor = 'amber' | 'blue' | 'green' | 'rose' | 'violet' | 'slate';

export interface HelpCenterSectionDto {
  id: string;
  icon: string;
  title: string;
  blurb: string;
  contentHtml: string;
  imageUrls?: string[];
  panelSpan?: HelpCenterSectionPanelSpan;
  optional?: boolean;
  guideStepId?: string | null;
  details?: string[];
  points?: string[];
}


export type HelpCenterDocumentKind = 'help' | 'privacy' | 'terms' | 'explanation';

export interface HelpCenterRevisionDto {
  isSystem?: boolean;
  id: string;
  documentKind?: HelpCenterDocumentKind;
  contextKey?: string | null;
  lang: string;
  languageLabel: string;
  version: number;
  title: string;
  summary: string;
  description: string;
  headerColor?: HelpCenterHeaderColor;
  presentation?: HelpCenterPresentation;
  sections: HelpCenterSectionDto[];
  active: boolean;
  createdAtIso: string;
  createdByUserId: string;
  updatedAtIso: string;
  updatedByUserId: string;
}


export interface HelpCenterGuideFieldDto {
  id: string;
  screenKey: string;
  group: string;
  i18nKey: string;
  order: number;
}

export type HelpCenterAuditAction = 'seed' | 'create' | 'update' | 'activate' | 'delete';

export interface ContentLanguage {
  lang: string;
  label: string;
}

export interface ExplainableSurface {
  isSystem?: boolean;
  key: string;
  label: string;
  icon: string;
  owner: 'route' | 'popup' | 'navigator';
  order: number;
  enabled: boolean;
}

export interface HelpCenterAuditEntryDto {
  id: string;
  documentKind?: HelpCenterDocumentKind;
  lang?: string;
  languageLabel?: string;
  revisionId: string | null;
  version: number | null;
  action: HelpCenterAuditAction;
  actorUserId: string;
  createdAtIso: string;
  message: string;
}

export interface HelpCenterStateDto {
  activeRevision: HelpCenterRevisionDto | null;
  revisions: HelpCenterRevisionDto[];
  auditTrail: HelpCenterAuditEntryDto[];
  availableLanguages: ContentLanguage[];
  guideFields: HelpCenterGuideFieldDto[];
}

export type PrivacyConsentSource = 'entry' | 'settings';

export interface PrivacyConsentDto {
  id: string;
  userId: string;
  revisionId: string;
  revisionVersion: number;
  approvedOptionalSectionIds: string[];
  acceptedAtIso: string;
  updatedAtIso: string;
  source: PrivacyConsentSource;
}

export interface PrivacyConsentSaveRequestDto {
  userId: string;
  revisionId: string;
  revisionVersion: number;
  approvedOptionalSectionIds: string[];
  source?: PrivacyConsentSource;
}

export interface SupportedCountryDto {
  countryCode: string;
  countryName: string;
}
