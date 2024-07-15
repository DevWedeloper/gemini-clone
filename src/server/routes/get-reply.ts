import { Content, GoogleGenerativeAI } from '@google/generative-ai';
import {
  createError,
  createEventStream,
  defineEventHandler,
  readBody,
} from 'h3';
import { z } from 'zod';

const apiKey: string = import.meta.env['GEMINI_API_KEY'];
const genAI = new GoogleGenerativeAI(apiKey);

const contentSchema = z.object({
  chat: z.string(),
  history: z.array(
    z.object({
      role: z.string(),
      parts: z.array(z.any()),
    }),
  ),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => {});
  const parseResult = contentSchema.safeParse(body);
  if (!parseResult.success) {
    throw createError({
      status: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid request body',
      data: parseResult.error.errors,
    });
  }

  const { chat, history } = parseResult.data;
  const eventStream = createEventStream(event);

  getReplyTest(chat, history, async (chunkText) => {
    await eventStream.push(JSON.stringify({ id: 'message', data: chunkText }));
  }).then(async () => {
    await eventStream.push(
      JSON.stringify({
        id: 'completion',
        data: 'Streaming complete.',
      }),
    );
    await eventStream.close();
  });

  eventStream.onClosed(async () => {
    await eventStream.close();
  });

  return eventStream.send();
});

async function getReplyTest(
  input: string,
  history: Content[],
  onResult: (chunkText: string) => void,
) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const chat = model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });

  const result = await chat.sendMessageStream(input);

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    onResult(chunkText);
  }
}
