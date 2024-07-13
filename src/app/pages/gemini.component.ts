import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { lucideBot, lucideMic } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { GeminiService } from '../shared/gemini.service';
import { SpeechService } from '../shared/speech.service';
import { ParsedTextComponent } from './parsed-text.component';

@Component({
  selector: 'app-gemini',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HlmButtonDirective,
    HlmInputDirective,
    HlmIconComponent,
    ParsedTextComponent,
  ],
  providers: [provideIcons({ lucideBot, lucideMic })],
  host: {
    class: 'flex min-h-[calc(100vh-3.5rem)] flex-col justify-between',
  },
  template: `
    <div class="flex flex-col p-4 md:pb-9">
      @for (prompt of selectedPrompt()?.content; track $index) {
        @if (prompt.role === 'user') {
          <div class="flex justify-end py-2">
            @for (part of prompt.parts; track $index) {
              <p class="rounded-lg bg-accent px-5 py-2.5">{{ part.text }}</p>
            }
          </div>
        }
        @if (prompt.role === 'model') {
          <div class="flex gap-5 py-2">
            <div class="flex h-8 w-8 justify-center">
              <hlm-icon name="lucideBot" />
            </div>
            @for (part of prompt.parts; track $index) {
              <app-parsed-text [text]="part.text || ''" />
            }
          </div>
        }
      } @empty {
        <p>No messages yet.</p>
      }
    </div>
    <div class="sticky bottom-0 bg-background p-4">
      <form
        [formGroup]="form"
        (ngSubmit)="sendMessage()"
        class="relative overflow-hidden rounded-lg border border-border bg-background focus-within:ring-1 focus-within:ring-ring"
      >
        <label htmlFor="message" class="sr-only">Message</label>
        <textarea
          formControlName="message"
          hlmInput
          id="message"
          [placeholder]="
            isListening() ? 'Listening...' : 'Type your message here...'
          "
          class="min-h-12 w-full resize-none border-0 p-3 shadow-none focus-visible:ring-0"
          (keydown.enter)="handleTextareaEnter($event)"
        ></textarea>
        <div class="flex items-center p-3">
          <button
            hlmBtn
            size="sm"
            variant="ghost"
            type="button"
            (click)="toggleMic()"
          >
            <hlm-icon name="lucideMic" size="sm" />
            <span class="sr-only">Use mic to start a new prompt</span>
          </button>
          <button
            hlmBtn
            size="sm"
            class="ml-auto gap-1.5"
            [disabled]="form.invalid"
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeminiComponent {
  private fb = inject(FormBuilder);
  private geminiService = inject(GeminiService);
  private speechService = inject(SpeechService);

  protected selectedPrompt = this.geminiService.selectedPrompt;
  private transcript = this.speechService.transcript;

  protected isListening = signal(false);

  protected form = this.fb.nonNullable.group({
    message: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      if (this.speechService.isListening())
        this.form.controls.message.setValue(this.transcript());
    });
  }

  protected handleTextareaEnter(event: Event): void {
    event.preventDefault();
    if (this.form.valid && this.form.controls.message.value) {
      this.sendMessage();
    }
  }

  protected sendMessage(): void {
    this.geminiService.sendMessage(
      this.selectedPrompt()?.id ?? null,
      this.form.getRawValue().message,
    );
    this.form.reset();
  }

  protected toggleMic(): void {
    this.isListening.set(!this.isListening());
    if (this.isListening()) {
      this.form.reset();
      this.speechService.startListening();
    } else this.speechService.stopListening();
  }
}
