import { computed, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  map,
  merge,
  scan,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpeechService {
  private recognition = computed(() => {
    if (
      typeof webkitSpeechRecognition === 'undefined' &&
      typeof SpeechRecognition === 'undefined'
    )
      return;

    const recognition = new (webkitSpeechRecognition || SpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    return recognition;
  });

  private isListening$ = new BehaviorSubject(false);
  private interimScript$ = new Subject<string>();
  private error$ = new Subject<SpeechRecognitionErrorCode | null>();

  private transcript$ = this.isListening$.pipe(
    switchMap(() =>
      this.interimScript$.pipe(
        startWith(''),
        scan((state: string[], text: string) => {
          if (text !== '') {
            return [...state.slice(0, -1), text.trimStart()];
          } else {
            return [...state, ''];
          }
        }, []),
        map((state) => state.filter((item) => item !== '')),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
        ),
      ),
    ),
    map((data) => data.join(' ')),
  );

  private status$ = merge(
    this.interimScript$.pipe(map(() => 'success' as const)),
    this.error$.pipe(
      map((error) => (error ? ('error' as const) : ('success' as const))),
    ),
  ).pipe(startWith('initial' as const));

  private status = toSignal(this.status$, { initialValue: 'initial' });

  private error = toSignal(this.error$, { initialValue: null });

  transcript = toSignal(this.transcript$, {
    initialValue: '',
  });

  isListening = toSignal(this.isListening$, { initialValue: false });

  noError = computed(() => {
    return this.status() !== 'error';
  });

  notAllowedError = computed(() => {
    return this.error() === 'not-allowed';
  });

  notAllowedError$ = this.error$.pipe(
    map((error) => error === 'not-allowed'),
    filter(Boolean),
  );

  startListening(): void {
    if (this.isListening$.value || !this.recognition()) return;

    this.recognition()!.onresult = (event: SpeechRecognitionEvent) => {
      const interimTranscript = Array.from(event.results)
        .slice(event.resultIndex)
        .filter((result) => !result.isFinal)
        .map((result) => result[0].transcript)
        .join('');

      this.interimScript$.next(interimTranscript);
    };

    this.recognition()!.onstart = () => {
      this.isListening$.next(true);
      this.error$.next(null);
    };

    this.recognition()!.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.error$.next(event.error);
    };

    this.recognition()!.start();
  }

  stopListening(): void {
    if (!this.isListening$.value || !this.recognition()) return;

    this.recognition()!.stop();
    this.isListening$.next(false);
  }
}
