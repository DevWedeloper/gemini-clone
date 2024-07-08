import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideMenu, lucideSquarePen } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';

@Component({
  selector: 'app-side-nav-actions',
  standalone: true,
  imports: [HlmButtonDirective, HlmIconComponent],
  providers: [provideIcons({ lucideMenu, lucideSquarePen })],
  host: {
    class: 'flex h-14 justify-between py-2',
  },
  template: `
    <button size="sm" variant="ghost" hlmBtn (click)="menuClicked.emit()">
      <hlm-icon name="lucideMenu" size="sm" />
      <span class="sr-only">Toggle sidebar visibility</span>
    </button>
    <button size="sm" variant="ghost" hlmBtn (click)="newPromptClicked.emit()">
      <hlm-icon name="lucideSquarePen" size="sm" />
      <span class="sr-only">Create a new prompt</span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavActionsComponent {
  menuClicked = output();
  newPromptClicked = output();
}
