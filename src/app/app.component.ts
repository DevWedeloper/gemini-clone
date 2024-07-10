import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { hlm } from '@spartan-ng/ui-core';
import { HeaderComponent } from './shared/header/header.component';
import {
  SideNavComponent,
  toggleSideNav,
} from './shared/layout/side-nav/side-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SideNavComponent, HeaderComponent],
  host: {
    '[class]': 'computedClass()',
  },
  template: `
    <app-side-nav />
    <main>
      <app-header />
      <router-outlet />
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected toggleSideNav = toggleSideNav;

  protected computedClass = computed(() => {
    const gridCols = toggleSideNav()
      ? 'md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]'
      : 'md:grid-cols-[0_1fr]';
    return hlm(
      'grid w-full grid-cols-none items-start transition-all ease-in-out',
      gridCols,
    );
  });
}
