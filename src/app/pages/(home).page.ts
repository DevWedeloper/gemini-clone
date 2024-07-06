import { ChangeDetectionStrategy, Component } from '@angular/core';

import { GeminiComponent } from './gemini.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [GeminiComponent],
  template: `
    <app-gemini />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent {}
