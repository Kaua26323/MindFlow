import { and, eq } from 'drizzle-orm';
import { favoritesPostsTable } from '../drizzle/schemas/favoritesPosts.schema.ts';

import type { DrizzleDatabase } from '../drizzle/connection.ts';
import type { FavoritesPostsRepository } from '@/application/repositories/favorites.repository.ts';
import type {
  FavoritePost,
  NewFavoritePost,
} from '../drizzle/schemas/favoritesPosts.schema.ts';

export class DrizzleFavoritesRepository implements FavoritesPostsRepository {
  private readonly db: DrizzleDatabase;

  constructor(db: DrizzleDatabase) {
    this.db = db;
  }

  async addPost(data: NewFavoritePost): Promise<FavoritePost | null> {
    const [savedPost] = await this.db
      .insert(favoritesPostsTable)
      .values(data)
      .onConflictDoNothing()
      .returning();

    return savedPost || null;
  }

  async getFavoritesPosts(userID: string): Promise<FavoritePost[] | []> {
    const favorites = await this.db.query.favoritesPostsTable.findMany({
      where: (item, { eq }) => eq(item.user_id, userID),
    });

    return favorites ?? [];
  }

  async removePost(data: NewFavoritePost): Promise<FavoritePost | null> {
    const { user_id, post_id } = data;

    const [deleted] = await this.db
      .delete(favoritesPostsTable)
      .where(
        and(
          eq(favoritesPostsTable.user_id, user_id),
          eq(favoritesPostsTable.post_id, post_id),
        ),
      )
      .returning();

    return deleted ?? null;
  }
}
