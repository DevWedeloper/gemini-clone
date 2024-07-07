import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-side-nav-content',
  standalone: true,
  imports: [],
  template: `
    <p>side-nav-content works!</p>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavContentComponent {
  promptClicked = output();
}
