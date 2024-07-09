import { CdkMenuTrigger } from '@angular/cdk/menu';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { ionEllipsisHorizontal } from '@ng-icons/ionicons';
import { lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmDialogService } from '@spartan-ng/ui-dialog-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmMenuComponent, HlmMenuImports } from '@spartan-ng/ui-menu-helm';
import { BrnTooltipContentDirective } from '@spartan-ng/ui-tooltip-brain';
import {
  HlmTooltipComponent,
  HlmTooltipTriggerDirective,
} from '@spartan-ng/ui-tooltip-helm';
import { GeminiService } from '../../gemini.service';
import { DeletePromptComponent } from './prompt-options/delete-prompt/delete-prompt.component';

@Component({
  selector: 'app-side-nav-content',
  standalone: true,
  imports: [
    NgClass,
    HlmButtonDirective,
    HlmInputDirective,
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
    class: 'flex flex-col',
  },
  template: `
    @for (history of promptHistory(); track history.id) {
      @if (displayInlineEdit(history.id)) {
        <input
          #prompt
          hlmInput
          type="text"
          [value]="history.title"
          (focusout)="handlePromptTitleEdit(history.id, prompt.value)"
          (keydown.enter)="handlePromptTitleEdit(history.id, prompt.value)"
        />
      } @else {
        <div class="group relative">
          <button
            hlmBtn
            variant="link"
            class="flex w-full justify-start p-2 hover:bg-accent hover:no-underline"
            (click)="handleClick(history.id)"
          >
            {{ history.title }}
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
      <p>No messages yet.</p>
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
  private editPromptTitle = this.geminiService.editPromptTitle;

  protected menuState = signal(false);

  protected inlineEditId = signal<number | null>(null);

  private prompt = viewChild<ElementRef<HTMLInputElement>>('prompt');

  constructor() {
    effect(() => {
      this.prompt()?.nativeElement.focus();
    });
  }

  protected handleClick(id: number): void {
    this.selectedPromptId.set(id);
    this.promptClicked.emit();
  }

  protected displayOptions(id: number): boolean {
    return this.selectedPromptId() === id && this.menuState();
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

  protected handlePromptTitleEdit(id: number, title: string): void {
    this.editPromptTitle(id, title);
    this.inlineEditId.set(null);
  }
}
