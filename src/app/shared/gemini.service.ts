import { computed, inject, Injectable, signal } from '@angular/core';
import { Content } from '@google/generative-ai';
import { distinctUntilChanged, scan, Subject, takeWhile } from 'rxjs';
import { SseService } from './sse.service';

type PromptHistory = {
  id: number;
  title: string;
  content: Content[];
};

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private sseService = inject(SseService);

  dataChunk$ = new Subject<{
    id: string;
    data: string;
  }>();

  data$ = this.dataChunk$.pipe(
    scan(
      (state, chunk) => {
        if (chunk.id !== 'completion') {
          return { ...state, id: chunk.id, data: state.data + chunk.data };
        } else {
          return { ...state, id: chunk.id };
        }
      },
      {
        id: '',
        data: '',
      },
    ),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
    ),
  );

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
    const selectedId = id ?? this.generateId();
    if (id === null) {
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
          selectedId,
        ),
      );
    }
    this.sseService.createEventSource(message, []).subscribe((data) => {
      this.dataChunk$.next(data);
    });
    this.data$
      .pipe(takeWhile((data) => data.id !== 'completion'))
      .subscribe((data) =>
        this.promptHistory.update((state) =>
          this.updatePromptHistoryWithPrompt(
            state,
            this.modelPrompt(data.data),
            selectedId,
          ),
        ),
      );
    if (generateIdFlag) this.generateId.update((state) => state + 1);
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
    return promptHistory.map((history) => {
      if (history.id === id) {
        const lastItem = history.content[history.content.length - 1];
        if (lastItem.role === 'model' && prompt.role !== 'user') {
          return {
            ...history,
            content: [...history.content.slice(0, -1), prompt],
          };
        }
        return {
          ...history,
          content: [...history.content, prompt],
        };
      } else {
        return history;
      }
    });
  }
}
