import { Injectable } from '@angular/core';

export type BootstrapProcessStage =
  | 'selector'
  | 'helpCenter'
  | 'chats'
  | 'users'
  | 'adminUsers'
  | 'operatorUsers'
  | 'indexedDb'
  | 'ready'
  | 'session'
  | 'sessionChats'
  | 'sessionIndexedDb'
  | 'sessionReady';

export interface BootstrapProcessState<Stage extends string = BootstrapProcessStage> {
  percent: number;
  label: string;
  stage: Stage;
}

export interface BootstrapProcessStep<Stage extends string = BootstrapProcessStage> {
  stage: Stage;
  percent: number;
  label: string;
}

export type BootstrapProcessListener<Stage extends string = BootstrapProcessStage> = (
  state: BootstrapProcessState<Stage>
) => void;

export const BOOTSTRAP_PROCESS_STEPS: readonly BootstrapProcessStep[] = [
  { stage: 'selector', percent: 0, label: 'Preparing demo selector' },
  { stage: 'chats', percent: 11, label: 'Loading chats' },
  { stage: 'users', percent: 34, label: 'Preparing demo users' },
  { stage: 'helpCenter', percent: 95, label: 'Preparing help content' },
  { stage: 'adminUsers', percent: 97, label: 'Preparing admin users' },
  { stage: 'operatorUsers', percent: 97, label: 'Preparing demo users' },
  { stage: 'indexedDb', percent: 98, label: 'Syncing demo IndexedDB' },
  { stage: 'ready', percent: 100, label: 'Demo data ready' }
];

export const SESSION_PROCESS_STEPS: readonly BootstrapProcessStep[] = [
  { stage: 'session', percent: 0, label: 'Preparing demo session' },
  { stage: 'sessionChats', percent: 38, label: 'Preparing chat threads' },
  { stage: 'sessionIndexedDb', percent: 84, label: 'Syncing demo IndexedDB' },
  { stage: 'sessionReady', percent: 100, label: 'Demo session ready' }
];

const PROCESS_STEP_BY_STAGE = new Map<BootstrapProcessStage, BootstrapProcessStep>(
  [...BOOTSTRAP_PROCESS_STEPS, ...SESSION_PROCESS_STEPS].map(step => [step.stage, step])
);

export function bootstrapProcessStep(stage: BootstrapProcessStage): BootstrapProcessState {
  return PROCESS_STEP_BY_STAGE.get(stage) ?? BOOTSTRAP_PROCESS_STEPS[0];
}

@Injectable({
  providedIn: 'root'
})
export class BootstrapProcessService {
  normalize<Stage extends string>(
    state: BootstrapProcessState<Stage>,
    fallbackLabel = 'Preparing data'
  ): BootstrapProcessState<Stage> {
    return {
      percent: Math.max(0, Math.min(100, Math.round(state.percent))),
      label: state.label.trim() || fallbackLabel,
      stage: state.stage
    };
  }

  async runStep<Stage extends string, T = void>(
    step: BootstrapProcessStep<Stage>,
    onProgress: BootstrapProcessListener<Stage> | undefined,
    work?: () => T | Promise<T>
  ): Promise<T> {
    onProgress?.(this.normalize(step));
    await this.waitForUiYield();
    const result = work ? await work() : undefined as T;
    await this.waitForUiYield();
    return result;
  }

  waitForUiYield(): Promise<void> {
    return new Promise(resolve => {
      if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(() => resolve());
        return;
      }
      setTimeout(resolve, 0);
    });
  }
}
