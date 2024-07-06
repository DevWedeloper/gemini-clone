import { getReply } from 'src/server/multi-turn-conversation';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const geminiRouter = router({
  chat: publicProcedure
    .input(
      z.object({
        chat: z.string(),
        history: z.array(
          z.object({
            role: z.string(),
            parts: z.array(z.any()),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => getReply(input.chat, input.history)),
});
