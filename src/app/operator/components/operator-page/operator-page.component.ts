import { Component, computed, effect, inject, output, untracked, ChangeDetectionStrategy } from '@angular/core';
import { AppMenuComponent, DeploymentBrandComponent, type AppMenuItem, I18nPipe } from '@fssrepository/myscoutee-components';
import { DeploymentConfigurationService } from '../../../shared/core/base/services/platform/deployment-configuration.service';
import { OperatorWorkspaceStore } from '../../../shared/ui/context/stores/operator/operator-workspace.store';
import { UserProfileStore } from '../../../shared/ui/context/stores/profile/user-profile.store';

@Component({
  selector: 'app-operator-page', standalone: true,
  imports: [AppMenuComponent, I18nPipe, DeploymentBrandComponent],
  templateUrl: './operator-page.component.html', changeDetection: ChangeDetectionStrategy.Eager,
 styleUrl: './operator-page.component.scss'
})
export class OperatorPageComponent {
  readonly actionSelected = output<string>();
  protected readonly deploymentBranding = inject(DeploymentConfigurationService).branding;
  protected readonly workspace = inject(OperatorWorkspaceStore);
  private readonly profiles = inject(UserProfileStore);
  constructor() {
    effect(() => {
      const userId = this.profiles.activeUserId();
      if (userId && this.profiles.activeUserIsOperator()) {
        untracked(() => { void this.workspace.preloadDeploymentUpdate(); });
      }
    });
  }
  protected readonly actionItems = computed<readonly AppMenuItem[]>(() => [{
    id: 'updates', label: 'operator.action.updates',
    detail: this.workspace.deploymentUpdate()?.updateAvailable
      ? 'operator.action.updates.available' : 'operator.action.updates.detail',
    icon: 'system_update_alt', palette: 'teal', kind: 'action', layout: 'big',
    counter: this.workspace.deploymentUpdate()?.updateAvailable ? 1 : null, counterTone: 'alert'
  }, {
    id: 'configuration', label: 'operator.action.configuration',
    detail: 'operator.action.configuration.detail', icon: 'tune', palette: 'blue', kind: 'action', layout: 'big'
  }]);
}
