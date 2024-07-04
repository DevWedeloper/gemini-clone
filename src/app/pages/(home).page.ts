import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AnalogWelcomeComponent } from './analog-welcome.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AnalogWelcomeComponent],
  template: `
    <app-analog-welcome />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent {}
