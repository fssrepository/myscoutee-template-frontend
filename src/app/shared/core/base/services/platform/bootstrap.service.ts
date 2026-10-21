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
  { stage: 'selector', percent: 0, label: 'demo.selector.loading.title' },
  { stage: 'chats', percent: 11, label: 'demo.seed.chats.loading' },
  { stage: 'users', percent: 34, label: 'demo.seed.users.preparing' },
  { stage: 'helpCenter', percent: 95, label: 'demo.seed.help.preparing' },
  { stage: 'adminUsers', percent: 97, label: 'demo.seed.admin.users.preparing' },
  { stage: 'operatorUsers', percent: 97, label: 'demo.seed.users.preparing' },
  { stage: 'indexedDb', percent: 98, label: 'demo.seed.database.syncing' },
  { stage: 'ready', percent: 100, label: 'demo.data.ready' }
];

export const SESSION_PROCESS_STEPS: readonly BootstrapProcessStep[] = [
  { stage: 'session', percent: 0, label: 'demo.session.preparing' },
  { stage: 'sessionChats', percent: 38, label: 'demo.seed.threads.preparing' },
  { stage: 'sessionIndexedDb', percent: 84, label: 'demo.seed.database.syncing' },
  { stage: 'sessionReady', percent: 100, label: 'demo.session.ready.title' }
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
