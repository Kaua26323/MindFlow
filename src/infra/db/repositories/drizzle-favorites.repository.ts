import { and, asc, count, desc, eq } from 'drizzle-orm';
import { postsTable } from '../drizzle/schemas/posts.schema.ts';
import { favoritesPostsTable } from '../drizzle/schemas/favoritesPosts.schema.ts';

import type { DrizzleDatabase } from '../drizzle/connection.ts';
import type {
  SearchParams,
  FavoritePost,
  FavoritePostDTO,
  PaginatedFavorite,
  FavoritesPostsRepository,
} from '@/application/repositories/favorites.repository.ts';
import type { Result } from '@/application/repositories/favorites.repository.ts';

export class DrizzleFavoritesRepository implements FavoritesPostsRepository {
  private readonly db: DrizzleDatabase;

  constructor(db: DrizzleDatabase) {
    this.db = db;
  }

  async addPost(data: FavoritePostDTO): Promise<FavoritePost | null> {
    const [savedPost] = await this.db
      .insert(favoritesPostsTable)
      .values(data)
      .onConflictDoNothing()
      .returning();

    return savedPost || null;
  }

  async getFavoritesPosts(
    userID: string,
    data: SearchParams,
  ): Promise<PaginatedFavorite<Result>> {
    const { page, order } = data;
    const limit = 10;
    const offset = (page - 1) * limit;

    const whereCondition = eq(favoritesPostsTable.user_id, userID);

    const querry = this.db
      .select({
        user_id: favoritesPostsTable.user_id,
        post_id: postsTable.id,
        text: postsTable.text,
        createdAt: favoritesPostsTable.createdAt,
      })
      .from(favoritesPostsTable)
      .innerJoin(postsTable, eq(favoritesPostsTable.post_id, postsTable.id))
      .$dynamic();

    const queryCount = this.db
      .select({ total: count() })
      .from(favoritesPostsTable)
      .where(whereCondition);

    const [dataResult, countResult] = await Promise.all([
      querry
        .where(whereCondition)
        .orderBy(
          order === 'ASC' ? asc(postsTable.createdAt) : desc(postsTable.createdAt),
        )
        .limit(limit)
        .offset(offset),
      queryCount,
    ]);

    return {
      data: dataResult ?? [],
      total: countResult[0]?.total ?? 0,
    };
  }

  async removePost(data: FavoritePostDTO): Promise<FavoritePost | null> {
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
