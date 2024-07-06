import { Content, GoogleGenerativeAI } from '@google/generative-ai';

const apiKey: string = import.meta.env['GEMINI_API_KEY'];
const genAI = new GoogleGenerativeAI(apiKey);

export async function getReply(input: string, history: Content[]) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const chat = model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 100,
    },
  });

  const result = await chat.sendMessage(input);
  const response = result.response;
  const text = response.text();

  return text;
}
