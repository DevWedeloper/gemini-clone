import { computed, Injectable, signal } from '@angular/core';
import { Content } from '@google/generative-ai';
import { take } from 'rxjs';
import { injectTrpcClient } from 'src/trpc-client';

export type PromptHistory = {
  id: number;
  title: string;
  content: Content[];
};

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private _trpc = injectTrpcClient();

  promptHistory = signal<PromptHistory[]>([]);
  selectedPromptId = signal<number | null>(null);
  selectedPrompt = computed(() =>
    this.promptHistory().find(
      (history) => history.id === this.selectedPromptId(),
    ),
  );
  generateId = signal(0);

  sendMessage(id: number | null, message: string): void {
    let generateIdFlag = false;
    if (this.selectedPromptId() === null) {
      this.promptHistory.update((state) => [
        ...state,
        {
          id: this.generateId(),
          title: message,
          content: [this.userPrompt(message)],
        },
      ]);
      this.selectedPromptId.set(this.generateId());
      generateIdFlag = true;
    } else if (this.selectedPrompt()) {
      this.promptHistory.update((state) =>
        this.updatePromptHistoryWithPrompt(
          state,
          this.userPrompt(message),
          id || this.generateId(),
        ),
      );
    }
    this._trpc.gemini.chat
      .mutate({
        chat: message,
        history: this.selectedPrompt()?.content || [],
      })
      .pipe(take(1))
      .subscribe((data) => {
        this.promptHistory.update((state) =>
          this.updatePromptHistoryWithPrompt(
            state,
            this.modelPrompt(data),
            id || this.generateId(),
          ),
        );
        if (generateIdFlag) this.generateId.update((state) => state + 1);
      });
  }

  deletePrompt(id: number): void {
    this.promptHistory.update((state) =>
      state.filter((history) => history.id !== id),
    );
    this.selectedPromptId.set(null);
  }

  editPromptTitle(id: number, title: string): void {
    this.promptHistory.update((state) =>
      state.map((history) =>
        history.id === id ? { ...history, title } : history,
      ),
    );
  }

  private userPrompt(message: string): Content {
    return {
      role: 'user',
      parts: [{ text: message }],
    };
  }

  private modelPrompt(data: string): Content {
    return {
      role: 'model',
      parts: [{ text: data }],
    };
  }

  private updatePromptHistoryWithPrompt(
    promptHistory: PromptHistory[],
    prompt: Content,
    id: number,
  ): PromptHistory[] {
    return promptHistory.map((history) =>
      history.id === id
        ? {
            ...history,
            content: [...history.content, prompt],
          }
        : history,
    );
  }
}
