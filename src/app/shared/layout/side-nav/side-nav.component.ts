import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideMenu, lucideSquarePen } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { hlm } from '@spartan-ng/ui-core';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { HlmScrollAreaComponent } from '@spartan-ng/ui-scrollarea-helm';
import { ClassValue } from 'clsx';
import { SideNavContentComponent } from './side-nav-content.component';

export const toggleSideNav = signal(true);

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    SideNavContentComponent,
    HlmScrollAreaComponent,
    HlmButtonDirective,
    HlmIconComponent,
  ],
  providers: [provideIcons({ lucideMenu, lucideSquarePen })],
  host: {
    '[class]': 'computedClass()',
  },
  template: `
    <hlm-scroll-area visibility="hover" class="h-screen">
      <div class="flex h-14 justify-between py-2">
        <button
          size="sm"
          variant="ghost"
          hlmBtn
          (click)="toggleSideNav.set(!toggleSideNav())"
        >
          <hlm-icon name="lucideMenu" class="h-5 w-5" />
          <span class="sr-only">Toggle sidebar visibility</span>
        </button>
        <button size="sm" variant="ghost" hlmBtn>
          <hlm-icon name="lucideSquarePen" class="h-5 w-5" />
          <span class="sr-only">Create a new prompt</span>
        </button>
      </div>
      <app-side-nav-content />
    </hlm-scroll-area>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavComponent {
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
