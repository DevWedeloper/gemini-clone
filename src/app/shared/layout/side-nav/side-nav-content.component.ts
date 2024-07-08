import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { GeminiService } from '../../gemini.service';

@Component({
  selector: 'app-side-nav-content',
  standalone: true,
  imports: [HlmButtonDirective],
  host: {
    class: 'flex flex-col',
  },
  template: `
    @for (history of promptHistory(); track $index) {
      <button
        hlmBtn
        variant="link"
        class="flex justify-start p-2 hover:bg-accent hover:no-underline"
        (click)="handleClick(history.id)"
      >
        {{ history.title }}
      </button>
    } @empty {
      <p>No messages yet.</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavContentComponent {
  promptClicked = output();

  private geminiService = inject(GeminiService);
  protected promptHistory = this.geminiService.promptHistory;
  private selectedPromptId = this.geminiService.selectedPromptId;

  protected handleClick(id: number): void {
    this.selectedPromptId.set(id);
    this.promptClicked.emit();
  }
}
