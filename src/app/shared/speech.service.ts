import { computed, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
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
    if (typeof window === 'undefined') return;

    const recognition = new (webkitSpeechRecognition || SpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    return recognition;
  });

  private isListening$ = new BehaviorSubject(false);
  private interimScript$ = new Subject<string>();

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

  transcript = toSignal(this.transcript$, {
    initialValue: '',
  });

  isListening = toSignal(this.isListening$, { initialValue: false });

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

    this.recognition()!.start();
    this.isListening$.next(true);
  }

  stopListening(): void {
    if (!this.isListening$.value || !this.recognition()) return;

    this.recognition()!.stop();
    this.isListening$.next(false);
  }
}
