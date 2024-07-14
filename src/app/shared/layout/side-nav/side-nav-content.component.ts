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
import { HlmDialogService } from '@spartan-ng/ui-dialog-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { HlmMenuComponent, HlmMenuImports } from '@spartan-ng/ui-menu-helm';
import { BrnTooltipContentDirective } from '@spartan-ng/ui-tooltip-brain';
import {
  HlmTooltipComponent,
  HlmTooltipTriggerDirective,
} from '@spartan-ng/ui-tooltip-helm';
import { GeminiService } from '../../gemini.service';
import { DeletePromptComponent } from './prompt-options/delete-prompt/delete-prompt.component';
import { EditPromptTitleComponent } from './prompt-options/edit-prompt-title/edit-prompt-title.component';

export const inlineEditId = signal<number | null>(null);

@Component({
  selector: 'app-side-nav-content',
  standalone: true,
  imports: [
    EditPromptTitleComponent,
    NgClass,
    HlmButtonDirective,
    HlmIconComponent,
    CdkMenuTrigger,
    HlmMenuImports,
    HlmButtonDirective,
    HlmIconComponent,
    HlmMenuComponent,
    HlmTooltipComponent,
    HlmTooltipTriggerDirective,
    BrnTooltipContentDirective,
  ],
  providers: [
    provideIcons({ ionEllipsisHorizontal, lucidePencil, lucideTrash2 }),
  ],
  host: {
    class: 'flex h-[calc(100%-3.5rem)] flex-col',
  },
  template: `
    @for (history of promptHistory(); track history.id) {
      @if (displayInlineEdit(history.id)) {
        <app-edit-prompt-title [id]="history.id" [title]="history.title" />
      } @else {
        <div class="group relative">
          <button
            hlmBtn
            variant="link"
            class="flex w-full justify-start p-2 hover:bg-accent hover:no-underline"
            (click)="handleClick(history.id)"
          >
            <span class="truncate">
              {{ history.title }}
            </span>
          </button>
          <hlm-tooltip>
            <button
              size="sm"
              variant="ghost"
              hlmBtn
              [cdkMenuTriggerFor]="optionsTpl"
              class="absolute right-0 top-1/2 w-fit -translate-y-1/2 group-hover:inline-flex"
              [ngClass]="displayOptions(history.id) ? 'inline-flex' : 'hidden'"
              (cdkMenuOpened)="menuState.set(true)"
              (cdkMenuClosed)="menuState.set(false)"
              hlmTooltipTrigger
              aria-describedby="Options"
            >
              <hlm-icon name="ionEllipsisHorizontal" size="sm" />
              <span class="sr-only">Open options</span>
            </button>
            <span *brnTooltipContent>Options</span>
          </hlm-tooltip>
        </div>
      }
      <ng-template #optionsTpl>
        <hlm-menu class="w-40">
          <button
            hlmMenuItem
            size="sm"
            variant="ghost"
            hlmBtn
            class="flex w-full justify-start"
            (click)="inlineEditId.set(history.id)"
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
            (click)="openDeleteDialog(history.id, history.title)"
          >
            <hlm-icon name="lucideTrash2" size="sm" class="mr-2" />
            Delete
          </button>
        </hlm-menu>
      </ng-template>
    } @empty {
      <div class="flex h-full items-center justify-center">
        <h4>No prompt history available.</h4>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavContentComponent {
  promptClicked = output();

  private _hlmDialogService = inject(HlmDialogService);
  private geminiService = inject(GeminiService);
  protected promptHistory = this.geminiService.promptHistory;
  private selectedPromptId = this.geminiService.selectedPromptId;

  protected menuState = signal(false);

  protected inlineEditId = inlineEditId;

  protected handleClick(id: number): void {
    this.selectedPromptId.set(id);
    this.promptClicked.emit();
  }

  protected displayOptions(id: number): boolean {
    return (
      this.selectedPromptId() === id ||
      (this.selectedPromptId() === id && this.menuState())
    );
  }

  protected displayInlineEdit(id: number): boolean {
    return this.inlineEditId() === id;
  }

  protected openDeleteDialog(id: number, title: string): void {
    this._hlmDialogService.open(DeletePromptComponent, {
      context: { id, title },
      contentClass: 'flex',
    });
  }
}
