import { Component } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideMenu } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { toggleSideNav } from '../layout/side-nav/side-nav.component';
import { HeaderDarkModeComponent } from './header-dark-mode.component';
import { HeaderMobileNavComponent } from './header-mobile-nav.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    HlmButtonDirective,
    HlmIconComponent,
    HeaderDarkModeComponent,
    HeaderMobileNavComponent,
  ],
  providers: [provideIcons({ lucideMenu })],
  host: {
    class: 'sticky inset-0 flex h-14 justify-between bg-background p-2',
  },
  template: `
    @if (!toggleSideNav()) {
      <button
        size="sm"
        variant="ghost"
        hlmBtn
        (click)="toggleSideNav.set(!toggleSideNav())"
        class="hidden md:block"
      >
        <hlm-icon name="lucideMenu" class="h-5 w-5" />
        <span class="sr-only">Toggle sidebar visibility</span>
      </button>
    }

    <app-mobile-nav class="md:hidden" />

    <app-dark-mode class="ml-auto" />
  `,
})
export class HeaderComponent {
  protected toggleSideNav = toggleSideNav;
}
