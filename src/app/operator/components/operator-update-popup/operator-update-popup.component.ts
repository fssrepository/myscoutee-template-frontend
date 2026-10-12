import {Component,ChangeDetectionStrategy,computed,inject,output} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {IndicatorComponent,AppMenuComponent,type AppMenuItem,type AppMenuItemSelectEvent,PopupComponent,type PopupModel,I18nPipe} from '@fssrepository/myscoutee-components';
import {OperatorWorkspaceStore} from '../../../shared/ui/context/stores/operator/operator-workspace.store';
import type {OperatorDeploymentUpdatePhase} from '../../../shared/core/contracts/operator/operator-update.interface';
import {I18nService} from '../../../shared/core/base/services/localization/i18n.service';
interface OperatorPopupActionContext {action:'refresh-update'|'apply-update'|'rollback-update';}
@Component({selector:'app-operator-update-popup',standalone:true,imports:[IndicatorComponent,MatIconModule,AppMenuComponent,PopupComponent,I18nPipe],
 templateUrl:'./operator-update-popup.component.html',styleUrl:'./operator-update-popup.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class OperatorUpdatePopupComponent {
 readonly closed=output<void>();
 protected readonly workspace=inject(OperatorWorkspaceStore);
 private readonly i18n=inject(I18nService);
 protected readonly busyAction=this.workspace.busyAction;
 protected readonly busy=computed(()=>this.busyAction()!==null);
 protected readonly popup = computed<PopupModel>(() => ({
   title: 'operator.action.updates', subtitle: 'operator.update.subtitle',
   ariaLabel: 'operator.action.updates', closeAriaLabel: 'operator.popup.close',
   size: 'small', height: 'auto', mobilePresentation: 'compact',
   headerTone: 'accent', headerPalette: 'teal', backdropTone: 'dim',
   bodyLayout: 'default', onClose: () => this.closed.emit()
 }));
 protected readonly actionItems=computed<readonly AppMenuItem<string,OperatorPopupActionContext>[]>(()=>{
        const update = this.workspace.deploymentUpdate();
        const updateKnown = update !== null;
        const updateFailed = update?.progress.phase === 'FAILED' || !!this.workspace.error();
        const updateRunning = !!update && !this.workspace.error()
          && !['IDLE', 'COMPLETED', 'FAILED'].includes(update.progress.phase);
        return [
          {
            id: 'operator-refresh-update',
            label: 'operator.update.refresh',
            icon: 'refresh',
            palette: 'blue',
            layout: 'action',
            disabled: this.busy() || updateRunning,
            progress: this.busyAction() === 'load-update'
              ? { state: 'loading', durationMs: 3000 }
              : null,
            context: { action: 'refresh-update' }
          },
          ...(!updateKnown || update?.updateAvailable || updateRunning || updateFailed ? [{
            id: 'operator-apply-update',
            label: 'operator.update.apply',
            icon: 'system_update_alt',
            palette: 'teal' as const,
            layout: 'action' as const,
            disabled: this.busy() || updateRunning || (!updateKnown && !updateFailed),
            context: { action: 'apply-update' as const }
          }] : []),
          ...(update?.rollback || updateFailed || this.busyAction() === 'rollback-update' ? [{
            id: 'operator-rollback-update',
            label: 'operator.update.rollback',
            icon: 'restore',
            palette: 'amber' as const,
            layout: 'action' as const,
            disabled: this.busy() || updateRunning,
            context: { action: 'rollback-update' as const }
          }] : [])
        ];
      });
 ngOnInit():void{this.workspace.clearFeedback();void this.workspace.loadDeploymentUpdate();}
 protected async onAction(event:AppMenuItemSelectEvent<string,OperatorPopupActionContext>):Promise<void>{switch(event.context?.action){case 'refresh-update':
        await this.workspace.refreshDeploymentUpdate();
        return;
case 'rollback-update':
        await this.workspace.rollbackDeploymentUpdate();
        return;
case 'apply-update':
        await this.workspace.applyDeploymentUpdate();
        return;}}
protected formatDate(value: string | null | undefined): string {
    const timestamp = Date.parse(`${value ?? ''}`);
    if (!Number.isFinite(timestamp)) {
      return '—';
    }
    return new Intl.DateTimeFormat(this.i18n.currentLanguage(), {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(timestamp));
  }

protected formatBytes(value: number): string {
    const bytes = Math.max(0, Number(value) || 0);
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    const units = ['KB', 'MB', 'GB', 'TB'];
    let size = bytes / 1024;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }
    return `${new Intl.NumberFormat(this.i18n.currentLanguage(), {
      maximumFractionDigits: size < 10 ? 1 : 0
    }).format(size)} ${units[unitIndex]}`;
  }

protected updatePhaseLabel(phase: OperatorDeploymentUpdatePhase): string {
    return `operator.update.phase.${phase.toLowerCase()}`;
  }
}
