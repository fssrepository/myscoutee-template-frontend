import type {
  GuideSection as HelpCenterSectionDto,
  GuideSectionPanelSpan as HelpCenterSectionPanelSpan,
  GuideDocumentKind as HelpCenterDocumentKind,
  GuidePresentation as HelpCenterPresentation,
  GuideHeaderColor as HelpCenterHeaderColor,
  GuideRevision as HelpCenterRevisionDto,
  GuideField as HelpCenterGuideFieldDto
} from '@fssrepository/myscoutee-components';

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
