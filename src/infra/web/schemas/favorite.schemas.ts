import z from 'zod';

export const favoriteSchema = z.object({
  user_id: z.string().min(1, 'UserID is invalid!'),
  post_id: z.string().min(1, 'PostID is invalid!'),
});

export type FavoriteInput = z.infer<typeof favoriteSchema>;
