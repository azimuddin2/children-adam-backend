import { z } from 'zod';

const createProjectSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Project Title is required',
    }),
    category: z.string({
      required_error: 'Project Category ID is required',
    }),
    description: z.string({
      required_error: 'Project Summary is required',
    }),
    content: z.string({
      required_error: 'Content is required',
    }),
  }),
});

const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    category: z.string().optional(),
    summary: z.string().optional(),
    content: z
      .string({
        required_error: 'Content is required',
      })
      .optional(),
  }),
});

export const ProjectValidations = {
  createProjectSchema,
  updateProjectSchema,
};
