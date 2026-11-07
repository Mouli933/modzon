import { z } from 'zod';

const emailSchema = z.string()
  .trim()
  .email('Enter a valid email address.')
  .max(255, 'Email must be 255 characters or fewer.')
  .transform((email) => email.toLowerCase());

const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters long.')
  .max(72, 'Password must be 72 characters or fewer.')
  .regex(/[a-z]/, 'Password must include a lowercase letter.')
  .regex(/[A-Z]/, 'Password must include an uppercase letter.')
  .regex(/[0-9]/, 'Password must include a number.')
  .refine((password) => Buffer.byteLength(password, 'utf8') <= 72, {
    message: 'Password is too long.',
  });

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(100, 'Name must be 100 characters or fewer.'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).strict().refine((values) => values.password === values.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.').max(72, 'Invalid credentials.'),
}).strict();

export const gameSlugSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid game slug.'),
});
