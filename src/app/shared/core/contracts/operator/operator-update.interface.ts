export type OperatorDeploymentUpdatePhase =
  | 'IDLE'
  | 'CHECKING'
  | 'DOWNLOADING'
  | 'VERIFYING'
  | 'INSTALLING'
  | 'CONFIGURING_PACKAGE'
  | 'LOADING_IMAGES'
  | 'VERIFYING_IMAGES'
  | 'PREPARING_DATA'
  | 'STARTING_SERVICES'
  | 'WAITING_FOR_HEALTH'
  | 'SWITCHING_INGRESS'
  | 'COMPLETED'
  | 'FAILED';

export interface OperatorDeploymentUpdateProgressDto {
  phase: OperatorDeploymentUpdatePhase;
  bytesDownloaded: number;
  bytesTotal: number;
  percent: number;
  message: string | null;
  updatedAt: string | null;
}

export type OperatorDeploymentUpdateProgressHandler = (
  progress: OperatorDeploymentUpdateProgressDto
) => void;

export interface OperatorRollbackDto {
  jobId: string;
  fromVersion: string;
  targetVersion: string;
  artifactSha256: string;
}

export interface OperatorDeploymentUpdateDto {
  rollback?: OperatorRollbackDto | null;
  currentVersion: string;
  availableVersion: string;
  updateAvailable: boolean;
  lastCheckedAt: string | null;
  lastUpdatedAt: string | null;
  progress: OperatorDeploymentUpdateProgressDto;
}
