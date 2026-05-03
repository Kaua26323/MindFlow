import type {
  NewFavoritePost,
  FavoritePost,
} from '@/infra/db/drizzle/schemas/favoritesPosts.schema.ts';

interface FavoritesPostsRepository {
  addPost(data: NewFavoritePost): Promise<FavoritePost | null>;
  removePost(data: NewFavoritePost): Promise<FavoritePost | null>;
  getFavoritesPosts(userID: string): Promise<FavoritePost[] | []>;
}

export type { FavoritesPostsRepository };
