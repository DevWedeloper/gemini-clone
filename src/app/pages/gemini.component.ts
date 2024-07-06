import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { lucideBot } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { take } from 'rxjs';
import { injectTrpcClient } from 'src/trpc-client';
import { GeminiService } from './gemini.service';

@Component({
  selector: 'app-gemini',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HlmButtonDirective,
    HlmInputDirective,
    HlmIconComponent,
  ],
  providers: [provideIcons({ lucideBot })],
  host: { class: 'flex min-h-screen flex-col justify-between p-4' },
  template: `
    <div class="flex flex-col md:pb-9">
      @for (history of history(); track $index) {
        @if (history.role === 'user') {
          <div class="flex justify-end py-2">
            @for (part of history.parts; track $index) {
              <p class="rounded-lg bg-accent px-5 py-2.5">{{ part.text }}</p>
            }
          </div>
        }
        @if (history.role === 'model') {
          <div class="flex gap-5 py-2">
            <div class="flex h-8 w-8 justify-center">
              <hlm-icon name="lucideBot" />
            </div>
            @for (part of history.parts; track $index) {
              <p>{{ part.text }}</p>
            }
          </div>
        }
      }
    </div>
    <div class="sticky bottom-0">
      <form
        [formGroup]="form"
        (ngSubmit)="sendMessage()"
        class="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
      >
        <label htmlFor="message" class="sr-only">Message</label>
        <textarea
          formControlName="message"
          hlmInput
          id="message"
          placeholder="Type your message here..."
          class="min-h-12 w-full resize-none border-0 p-3 shadow-none focus-visible:ring-0"
        ></textarea>
        <div class="flex items-center p-3">
          <Button hlmBtn size="sm" class="ml-auto gap-1.5">Send Message</Button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeminiComponent {
  private _trpc = injectTrpcClient();
  private fb = inject(FormBuilder);
  protected history = inject(GeminiService).history;

  protected form = this.fb.nonNullable.group({
    message: '',
  });

  protected sendMessage() {
    this.history.update((state) => [
      ...state,
      {
        role: 'user',
        parts: [{ text: this.form.getRawValue().message }],
      },
    ]);
    this._trpc.gemini.chat
      .mutate({
        chat: this.form.getRawValue().message,
        history: this.history(),
      })
      .pipe(take(1))
      .subscribe((data) =>
        this.history.update((state) => [
          ...state,
          {
            role: 'model',
            parts: [{ text: data }],
          },
        ]),
      );
    this.form.reset();
  }
}
