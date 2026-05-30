import z from 'zod';

export const createPostSchema = z.object({
  user_id: z.string().min(1, 'UserID is invalid!'),
  text: z
    .string()
    .min(1, 'Type a text!')
    .max(150, 'Maximum 150 characters allowed.'),
});

export const updatePostSchema = z.object({
  post_id: z.string().min(1, 'Invalid postID!'),
  user_id: z.string().min(1, 'UserID is invalid!'),
  text: z
    .string()
    .min(1, 'Type a text!')
    .max(150, 'Maximum 150 characters allowed.'),
});

export const removePostSchema = z.object({
  post_id: z.string().min(1, 'Invalid postID!'),
  user_id: z.string().min(1, 'UserID is invalid!'),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type RemovePostInput = z.infer<typeof removePostSchema>;
