import type { UiBranding as DeploymentBrandingDto } from '@fssrepository/myscoutee-components';
import type { DeploymentPrivacyContactDto, DeploymentSocialLinkDto } from '../platform/deployment-configuration.interface';

export type OperatorConfigurationTestKind = 'FIREBASE_AUTHENTICATION' | 'FIREBASE_MESSAGING';

export type OperatorConfigurationCapability = 'AVAILABLE' | 'BACKEND_UNAVAILABLE';

export interface OperatorIntegrationConfigurationDto {
  publicBaseUrl: string | null;
}

export interface OperatorFirebaseConfigurationDto {
  projectId: string;
  authenticationCredentialConfigured: boolean;
  messagingCredentialConfigured: boolean;
  publicConfiguration: OperatorFirebasePublicConfigurationDto;
  active: boolean;
  readyToActivate: boolean;
  authenticationTestedAt: string | null;
  messagingTestedAt: string | null;
  activatedAt: string | null;
}

export interface OperatorFirebasePublicConfigurationDto {
  revision: number;
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string | null;
  vapidKey: string | null;
}

export interface OperatorConfigurationDto {
  capability: OperatorConfigurationCapability;
  unavailableReason: string | null;
  adminEmails: readonly string[];
  privacyContact: DeploymentPrivacyContactDto;
  socialLinks: readonly DeploymentSocialLinkDto[];
  branding: DeploymentBrandingDto;
  integration?: OperatorIntegrationConfigurationDto;
  firebase: OperatorFirebaseConfigurationDto;
  updatedAt: string | null;
}

export interface OperatorConfigurationTestRequestDto {
  kind: OperatorConfigurationTestKind;
  destinationToken?: string;
  browserReadinessToken?: string;
  browserConfigurationRevision?: number;
  browserAppId?: string;
}

export interface OperatorConfigurationTestResultDto {
  kind: OperatorConfigurationTestKind;
  success: boolean;
  message: string;
  testedAt: string;
  firebase: OperatorFirebaseConfigurationDto | null;
}

export interface OperatorConfigurationSaveRequestDto {
  adminEmails: readonly string[];
  privacyContact: {
    dataControllerName: string;
    privacyContactEmail: string;
  };
  socialLinks: readonly DeploymentSocialLinkDto[];
  branding: {
    productName: string;
    logoUrl: string;
    logoCharacterIndex: number | null;

  };
  integration?: {
    publicBaseUrl: string;
  };
  firebase: {
    projectId: string;
    apiKey: string;
    authDomain: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
    vapidKey: string;
    authenticationCredential: string;
    messagingCredential: string;
  };
}

export type OperatorTlsCertificateMode = 'AUTOMATIC' | 'MANUAL';

export type OperatorTlsTestKind = 'DOMAIN' | 'CERTIFICATE';

export type OperatorTlsJobPhase =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REJECTED';

export interface OperatorTlsConfigurationDto {
  capability: OperatorConfigurationCapability;
  unavailableReason: string | null;
  enabled: boolean;
  mode: OperatorTlsCertificateMode;
  domain: string;
  contactEmail: string;
  autoRenew: boolean;
  certificateConfigured: boolean;
  certificateIssuer: string | null;
  certificateExpiresAt: string | null;
  updatedAt: string | null;
}

export interface OperatorTlsConfigurationUpdateDto {
  enabled: boolean;
  mode: OperatorTlsCertificateMode;
  domain: string;
  contactEmail: string;
  autoRenew: boolean;
  certificate: string;
  privateKey: string;
}

export interface OperatorTlsTestRequestDto {
  kind: OperatorTlsTestKind;
  configuration: OperatorTlsConfigurationUpdateDto;
}

export interface OperatorTlsJobDto {
  jobId: string;
  phase: OperatorTlsJobPhase;
  percent: number;
  message: string;
  updatedAt: string;
  configuration: OperatorTlsConfigurationDto | null;
}
