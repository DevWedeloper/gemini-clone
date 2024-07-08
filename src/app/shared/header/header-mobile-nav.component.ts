import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideMenu, lucideSquarePen } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { HlmScrollAreaComponent } from '@spartan-ng/ui-scrollarea-helm';
import {
  BrnSheetContentDirective,
  BrnSheetTriggerDirective,
} from '@spartan-ng/ui-sheet-brain';
import { HlmSheetImports } from '@spartan-ng/ui-sheet-helm';
import { GeminiService } from '../gemini.service';
import { SideNavContentComponent } from '../layout/side-nav/side-nav-content.component';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [
    SideNavContentComponent,
    BrnSheetTriggerDirective,
    BrnSheetContentDirective,
    HlmSheetImports,
    HlmButtonDirective,
    HlmIconComponent,
    HlmScrollAreaComponent,
    RouterLink,
  ],
  providers: [provideIcons({ lucideMenu, lucideSquarePen })],
  template: `
    <hlm-sheet side="left" closeDelay="100">
      <button
        size="sm"
        id="menu-trigger"
        variant="ghost"
        brnSheetTrigger
        hlmBtn
      >
        <hlm-icon name="lucideMenu" size="sm" />
        <span class="sr-only">Open menu</span>
      </button>
      <hlm-sheet-content
        class="pb-0 pr-0"
        *brnSheetContent="let ctx"
        class="px-3 py-0"
      >
        <div class="flex h-14 justify-between py-2">
          <button size="sm" variant="ghost" hlmBtn (click)="ctx.close()">
            <hlm-icon name="lucideMenu" class="h-5 w-5" />
            <span class="sr-only">Toggle sidebar visibility</span>
          </button>
          <button size="sm" variant="ghost" (click)="selectedPromptId.set(null)">
            <hlm-icon name="lucideSquarePen" class="h-5 w-5" />
            <span class="sr-only">Create a new prompt</span>
          </button>
        </div>
        <div class="flex items-center pb-2"></div>
        <hlm-scroll-area class="h-[calc(100vh-8rem)]">
          <app-side-nav-content (promptClicked)="ctx.close()" />
        </hlm-scroll-area>
      </hlm-sheet-content>
    </hlm-sheet>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderMobileNavComponent {
  protected selectedPromptId = inject(GeminiService).selectedPromptId;
}
