import { NgComponentOutlet } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { I18nPipe, IndicatorComponent, PopupComponent } from '@fssrepository/myscoutee-components';
import { ProfileEditorStore } from '../../context/stores/profile/profile-editor.store';

@Component({
  selector: 'app-profile-editor-host',
  standalone: true,
  imports: [NgComponentOutlet, MatIconModule, I18nPipe, IndicatorComponent, PopupComponent],
  templateUrl: './profile-editor-host.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './profile-editor-host.component.scss'
})
export class ProfileEditorHostComponent {
  protected readonly editor = inject(ProfileEditorStore);
}
