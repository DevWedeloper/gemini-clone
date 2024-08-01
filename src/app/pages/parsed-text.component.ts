import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';
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
import * as IncrementalDOM from 'incremental-dom';
import MarkdownIt from 'markdown-it';
// @ts-ignore
import MarkdownItIncrementalDOM from 'markdown-it-incremental-dom';

@Component({
  selector: 'app-parsed-text',
  standalone: true,
  template: `
    <div #content></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParsedTextComponent {
  text = input.required<string>();

  private content = viewChild.required<ElementRef<HTMLDivElement>>('content');

  private md = computed(() => {
    const md = new MarkdownIt().use(MarkdownItIncrementalDOM, IncrementalDOM);

    md.renderer.rules['heading_open'] = (tokens, idx) => {
      const level = parseInt(tokens[idx].tag.substr(1), 10);
      switch (level) {
        case 1:
          return `<h1 class="${hlmH1}">`;
        case 2:
          return `<h2 class="${hlmH2}">`;
        case 3:
          return `<h3 class="${hlmH3}">`;
        case 4:
          return `<h4 class="${hlmH4}">`;
        default:
          return `<h${level}>`;
      }
    };

    md.renderer.rules['paragraph_open'] = () => `<p class="${hlmP}">`;
    md.renderer.rules['paragraph_close'] = () => '</p>';

    md.renderer.rules['blockquote_open'] = () =>
      `<blockquote class="${hlmBlockquote}">`;

    md.renderer.rules['bullet_list_open'] = () => `<ul class="${hlmUl}">`;

    md.renderer.rules['ordered_list_open'] = () => `<ol class="${hlmUl}">`;

    md.renderer.rules.code_block = (tokens, idx) =>
      `<pre><code class="${hlmCode}">${tokens[idx].content}</code></pre>`;

    return md;
  });

  constructor() {
    effect(() =>
      IncrementalDOM.patch(
        this.content().nativeElement,
        (this.md() as any).renderToIncrementalDOM(this.text()),
      ),
    );
  }
}
