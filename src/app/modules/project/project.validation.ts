import { z } from 'zod';

const createProjectSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Project Title is required',
    }),
    category: z.string({
      required_error: 'Project Category ID is required',
    }),
    summary: z.string({
      required_error: 'Project Summary is required',
    }),
    description: z.object({
      lead: z.string({
        required_error: 'Project Lead is required',
      }),
      body: z.string({
        required_error: 'Project Description is required',
      }),
      quote: z.string().optional(),
    }),
  }),
});

const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    category: z.string().optional(),
    summary: z.string().optional(),
    description: z
      .object({
        lead: z.string().optional(),
        body: z.string().optional(),
        quote: z.string().optional(),
      })
      .optional(),
  }),
});

export const ProjectValidations = {
  createProjectSchema,
  updateProjectSchema,
};
