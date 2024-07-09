import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { HlmScrollAreaComponent } from '@spartan-ng/ui-scrollarea-helm';
import { ClassValue } from 'clsx';
import { GeminiService } from '../../gemini.service';
import { SideNavActionsComponent } from './side-nav-actions.component';
import { SideNavContentComponent } from './side-nav-content.component';

export const toggleSideNav = signal(true);

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    SideNavContentComponent,
    SideNavActionsComponent,
    HlmScrollAreaComponent,
  ],
  host: {
    '[class]': 'computedClass()',
  },
  template: `
    <hlm-scroll-area visibility="hover" class="h-screen">
      <app-side-nav-actions
        (menuClicked)="toggleSideNav.set(!toggleSideNav())"
        (newPromptClicked)="selectedPromptId.set(null)"
      />
      <app-side-nav-content />
    </hlm-scroll-area>
  `,
  styles: [
    `
      hlm-scroll-area .ng-scroll-content {
        display: inline;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SideNavComponent {
  protected selectedPromptId = inject(GeminiService).selectedPromptId;

  protected toggleSideNav = toggleSideNav;

  userClass = input<ClassValue>('', { alias: 'class' });
  protected computedClass = computed(() => {
    const translateX = this.toggleSideNav()
      ? 'translate-x-0'
      : '-translate-x-full';
    return hlm(
      'inset-0 z-30 hidden w-full px-3 transition ease-in-out md:sticky md:block',
      translateX,
      this.userClass(),
    );
  });
}
