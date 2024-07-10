import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { GeminiService } from 'src/app/shared/gemini.service';
import { inlineEditId } from '../../side-nav-content.component';

@Component({
  selector: 'app-edit-prompt-title',
  standalone: true,
  imports: [HlmInputDirective],
  template: `
    <input
      #prompt
      hlmInput
      type="text"
      [value]="title()"
      (blur)="handlePromptTitleEdit(id(), prompt.value)"
      (keydown.enter)="handlePromptTitleEdit(id(), prompt.value)"
      (keydown.esc)="handleKeydownEscape()"
      class="w-full"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPromptTitleComponent {
  private geminiService = inject(GeminiService);

  id = input.required<number>();
  title = input.required<string>();

  private isEscaping = signal(false);
  private prompt = viewChild<ElementRef<HTMLInputElement>>('prompt');

  protected inlineEditId = inlineEditId;

  constructor() {
    effect(() => {
      this.prompt()?.nativeElement.focus();
    });
  }

  protected handlePromptTitleEdit(id: number, title: string): void {
    if (!this.isEscaping()) {
      this.geminiService.editPromptTitle(id, title);
      this.inlineEditId.set(null);
    }
    this.isEscaping.set(false);
  }

  protected handleKeydownEscape(): void {
    this.isEscaping.set(true);
    this.inlineEditId.set(null);
  }
}
