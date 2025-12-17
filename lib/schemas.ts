import { z } from 'zod';

export const AIActionSchema = z.object({
  type: z.enum(['create', 'update', 'delete']),
  path: z.string(),
  content: z.string().optional(),
});

export const AIResponseSchema = z.object({
  message: z.string(),
  actions: z.array(AIActionSchema),
});

export const RouterSchema = z.object({
  target: z.enum(['CODE', 'UI', 'FIX']),
  reasoning: z.string().optional()
});

export type ValidatedAIResponse = z.infer<typeof AIResponseSchema>;
export type RouterResponse = z.infer<typeof RouterSchema>;