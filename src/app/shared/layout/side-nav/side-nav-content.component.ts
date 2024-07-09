import { CdkMenuTrigger } from '@angular/cdk/menu';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
} from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { ionEllipsisHorizontal } from '@ng-icons/ionicons';
import { lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { HlmMenuComponent, HlmMenuImports } from '@spartan-ng/ui-menu-helm';
import { GeminiService } from '../../gemini.service';

@Component({
  selector: 'app-side-nav-content',
  standalone: true,
  imports: [
    NgClass,
    HlmButtonDirective,
    HlmIconComponent,
    CdkMenuTrigger,
    HlmMenuImports,
    HlmButtonDirective,
    HlmIconComponent,
    HlmMenuComponent,
  ],
  providers: [
    provideIcons({ ionEllipsisHorizontal, lucidePencil, lucideTrash2 }),
  ],
  host: {
    class: 'flex flex-col',
  },
  template: `
    @for (history of promptHistory(); track $index) {
      <div class="group relative">
        <button
          hlmBtn
          variant="link"
          class="flex w-full justify-start p-2 hover:bg-accent hover:no-underline"
          (click)="handleClick(history.id)"
        >
          {{ history.title }}
        </button>
        <button
          size="sm"
          variant="ghost"
          hlmBtn
          [cdkMenuTriggerFor]="optionsTpl"
          class="absolute right-0 top-1/2 w-fit -translate-y-1/2 group-hover:inline-flex"
          [ngClass]="displayOptions(history.id) ? 'inline-flex' : 'hidden'"
          (cdkMenuOpened)="menuState.set(true)"
          (cdkMenuClosed)="menuState.set(false)"
        >
          <hlm-icon name="ionEllipsisHorizontal" size="sm" />
          <span class="sr-only">Open options</span>
        </button>
      </div>
    } @empty {
      <p>No messages yet.</p>
    }
    <ng-template #optionsTpl>
      <hlm-menu class="w-40">
        <button
          hlmMenuItem
          size="sm"
          variant="ghost"
          hlmBtn
          class="flex w-full justify-start"
        >
          <hlm-icon name="lucidePencil" size="sm" class="mr-2" />
          Rename
        </button>
        <button
          hlmMenuItem
          size="sm"
          variant="ghost"
          hlmBtn
          class="flex w-full justify-start text-red-500 hover:text-red-500"
        >
          <hlm-icon name="lucideTrash2" size="sm" class="mr-2" />
          Delete
        </button>
      </hlm-menu>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavContentComponent {
  promptClicked = output();

  private geminiService = inject(GeminiService);
  protected promptHistory = this.geminiService.promptHistory;
  protected selectedPromptId = this.geminiService.selectedPromptId;

  protected menuState = signal(false);

  protected handleClick(id: number): void {
    this.selectedPromptId.set(id);
    this.promptClicked.emit();
  }

  protected displayOptions(id: number): boolean {
    return this.selectedPromptId() === id || this.menuState();
  }
}
