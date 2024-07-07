import { Injectable, signal } from '@angular/core';
import { Content } from '@google/generative-ai';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  history = signal<Content[]>([]);
}
