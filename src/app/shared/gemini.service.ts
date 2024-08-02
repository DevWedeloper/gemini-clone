import { computed, inject, Injectable, signal } from '@angular/core';
import { Content } from '@google/generative-ai';
import {
  catchError,
  concatMap,
  delay,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  merge,
  of,
  scan,
  share,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  takeWhile,
  tap,
} from 'rxjs';
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

  private error$ = new Subject<void>();

  private sendMessage$ = new Subject<{
    id: number | null;
    message: string;
  }>();

  private dataChunk$ = this.sendMessage$.pipe(
    map(({ id, message }) => ({
      id: id ?? this.generateId(),
      message,
      newPrompt: id === null,
    })),
    tap(({ id, message, newPrompt }) => {
      if (newPrompt) {
        this.promptHistory.update((state) => [
          ...state,
          {
            id: id,
            title: message,
            content: [this.userPrompt(message)],
          },
        ]);
        this.selectedPromptId.set(id);
        this.generateId.update((state) => state + 1);
      } else {
        this.promptHistory.update((state) =>
          this.updatePromptHistoryWithPrompt(
            state,
            this.userPrompt(message),
            id,
          ),
        );
      }
    }),
    map(({ id, message }) => ({
      message,
      history:
        this.promptHistory().find((history) => history.id === id)?.content ??
        [],
      id,
    })),
    switchMap(({ message, history, id }) =>
      this.sseService.createEventSource(message, history).pipe(
        map((data) => ({ ...data, status: data.status, id })),
        catchError(() => {
          this.error$.next();
          return EMPTY;
        }),
      ),
    ),
    concatMap((data) => {
      const words = data.data.split(/(\s+)/).filter(Boolean);
      return of(...words).pipe(
        concatMap((word) =>
          of(word).pipe(
            delay(30),
            map((currentWord) => ({
              ...data,
              data: currentWord,
            })),
          ),
        ),
      );
    }),
  );

  private data$ = this.dataChunk$.pipe(
    scan(
      (state, chunk) => {
        if (chunk.status !== 'completion') {
          return {
            ...state,
            data: state.data + chunk.data,
            status: chunk.status,
            id: chunk.id,
          };
        } else {
          return { ...state, data: '', status: chunk.status };
        }
      },
      {
        data: '',
        status: '',
        id: 0,
      },
    ),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
    ),
    share(),
  );

  private status$ = merge(
    this.data$.pipe(
      map((data) =>
        data.status === 'completion'
          ? ('complete' as const)
          : ('ongoing' as const),
      ),
    ),
    this.error$.pipe(map(() => 'error' as const)),
  ).pipe(startWith('initial' as const), shareReplay(1));

  errorStatus$ = this.status$.pipe(
    map((status) => status === 'error'),
    filter(Boolean),
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
    this.data$
      .pipe(takeWhile((data) => data.status !== 'completion'))
      .subscribe(({ data, id }) => {
        this.promptHistory.update((state) =>
          this.updatePromptHistoryWithPrompt(state, this.modelPrompt(data), id),
        );
      });
    this.sendMessage$.next({ id, message });
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
