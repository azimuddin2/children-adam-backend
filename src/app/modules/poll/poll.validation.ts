import { z } from 'zod';
import { PollStatus } from './poll.constant';

const PollOptionSchema = z.object({
  optionText: z.string({ required_error: 'Option test is required' }),
});

const PollQuestionSchema = z.object({
  questionText: z.string({ required_error: 'Question text is required' }),
  options: z.array(PollOptionSchema).min(2, 'At least two option is required'),
});

const createPollValidationSchema = z.object({
  title: z.string({ required_error: 'Poll title is required' }),
  startDate: z.string({ required_error: 'Start date is required' }),
  endDate: z.string({ required_error: 'End date is required' }),
  status: z.enum(PollStatus as [string, ...string[]]).default('active'),
  questions: z
    .array(PollQuestionSchema)
    .min(1, 'At least one question is required'),
  responses: z.number().nonnegative().optional(),
  isDeleted: z.boolean().optional(),
});

export const PollValidations = {
  createPollValidationSchema,
};
