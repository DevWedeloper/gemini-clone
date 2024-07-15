import { Injectable } from '@angular/core';
import { Content } from '@google/generative-ai';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SseService {
  createEventSource(
    chat: string,
    history: Content[],
  ): Observable<{
    id: string;
    data: string;
  }> {
    return new Observable((observer) => {
      fetch('http://localhost:5173/api/get-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chat, history }),
      })
        .then((response) => {
          const { body } = response;
          if (!body) {
            throw new Error('Body not found');
          }

          const reader = body.getReader();
          const decoder = new TextDecoder('utf-8');

          function readStream() {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  observer.complete();
                  return;
                }

                const chunk = decoder.decode(value, { stream: true });
                const data = chunk
                  .split('\n')
                  .filter((s) => s.length > 0)
                  .map((s) => s.replace(/^data: /, ''))
                  .join('');
                const jsonData = JSON.parse(data);

                observer.next(jsonData);
                if (jsonData.id === 'completion') {
                  observer.complete();
                  return;
                }

                readStream();
              })
              .catch((error) => {
                observer.error(error);
              });
          }

          readStream();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
}
