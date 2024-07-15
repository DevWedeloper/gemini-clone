import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RouteMeta } from '@analogjs/router';
import { metaWith } from '../shared/meta/meta.util';
import { GeminiComponent } from './gemini.component';

export const routeMeta: RouteMeta = {
  meta: metaWith(
    'Gemini Clone - Home',
    'Access and interact with the Gemini API.',
  ),
  title: 'Gemini Clone - Home',
};

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
