import { z } from 'zod';

export const AIActionSchema = z.object({
  type: z.enum(['create', 'update', 'delete']),
  path: z.string(),
  content: z.string().optional(),
});

export const AIResponseSchema = z.object({
  reasoning: z.string().optional().describe("The thought process behind the changes"),
  message: z.string(),
  actions: z.array(AIActionSchema),
});

export const RouterSchema = z.object({
  target: z.enum(['CODE', 'UI', 'FIX']),
  reasoning: z.string().optional()
});

export const SuggestionsSchema = z.object({
  suggestions: z.array(z.string()).length(3)
});

export type ValidatedAIResponse = z.infer<typeof AIResponseSchema>;
export type RouterResponse = z.infer<typeof RouterSchema>;
export type SuggestionsResponse = z.infer<typeof SuggestionsSchema>;