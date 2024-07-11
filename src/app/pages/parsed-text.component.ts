import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  hlmBlockquote,
  hlmCode,
  hlmH1,
  hlmH2,
  hlmH3,
  hlmH4,
  hlmP,
  hlmUl,
} from '@spartan-ng/ui-typography-helm';
import { marked } from 'marked';
import { from, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-parsed-text',
  standalone: true,
  template: `
    <div [innerHTML]="parsedText()"></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParsedTextComponent {
  text = input.required<string>();
  marked = computed(() => {
    const renderer = new marked.Renderer();

    renderer.heading = (text, level) => {
      switch (level) {
        case 1:
          return `<h1 class="${hlmH1}">${text}</h1>`;
        case 2:
          return `<h2 class="${hlmH2}">${text}</h2>`;
        case 3:
          return `<h3 class="${hlmH3}">${text}</h3>`;
        case 4:
          return `<h4 class="${hlmH4}">${text}</h4>`;
        default:
          return `<h${level}>${text}</h${level}>`;
      }
    };

    renderer.paragraph = (text) => {
      return `<p class="${hlmP}">${text}</p>`;
    };

    renderer.blockquote = (text) => {
      return `<blockquote class="${hlmBlockquote}">${text}</blockquote>`;
    };

    renderer.list = (body) => {
      return `<ul class="${hlmUl}">${body}</ul>`;
    };

    renderer.code = (text) => {
      return `<pre><code class="${hlmCode}">${text}</code></pre>`;
    };

    return marked.use({
      renderer,
    });
  });

  parsedText = toSignal(
    toObservable(this.text).pipe(
      map((value) => this.marked().parse(value || '')),
      switchMap((data) => (typeof data === 'string' ? of(data) : from(data))),
    ),
    {
      initialValue: '',
    },
  );
}
