import { postsTable } from '../drizzle/schemas/posts.schema.ts';
import { usersTable } from '../drizzle/schemas/users.schema.ts';
import { and, asc, count, desc, eq, like, sql } from 'drizzle-orm';
import { favoritesPostsTable } from '../drizzle/schemas/favoritesPosts.schema.ts';

import type { DrizzleDatabase } from '../drizzle/connection.ts';
import type {
  Post,
  CreatePostDTO,
  PostWithUserName,
} from '@/application/repositories/post.repository.ts';
import type {
  SearchParams,
  PostRepository,
  PaginatedResult,
} from '@/application/repositories/post.repository.ts';

export class DrizzlePostRepository implements PostRepository {
  private readonly db: DrizzleDatabase;

  constructor(db: DrizzleDatabase) {
    this.db = db;
  }

  async create(postData: CreatePostDTO): Promise<Post | null> {
    const [newPost] = await this.db.insert(postsTable).values(postData).returning();

    return newPost ?? null;
  }

  async getAll(
    { page, search, order }: SearchParams,
    userID?: string,
  ): Promise<PaginatedResult<PostWithUserName>> {
    const limit = 10;
    const offset = (page - 1) * limit;

    const whereCondition = search ? like(postsTable.text, `%${search}%`) : undefined;

    const query = this.db
      .select({
        id: postsTable.id,
        text: postsTable.text,
        userName: usersTable.name,
        userID: postsTable.user_id,
        isFavorite: userID
          ? sql<boolean>`CASE WHEN ${favoritesPostsTable.user_id} IS NOT NULL THEN TRUE ELSE FALSE END`
          : sql<boolean>`FALSE`,
        createdAt: postsTable.createdAt,
      })
      .from(postsTable)
      .innerJoin(usersTable, eq(postsTable.user_id, usersTable.id))
      .$dynamic();

    if (userID) {
      query.leftJoin(
        favoritesPostsTable,
        and(
          eq(favoritesPostsTable.post_id, postsTable.id),
          eq(favoritesPostsTable.user_id, userID),
        ),
      );
    }

    const queryCount = this.db
      .select({ total: count() })
      .from(postsTable)
      .innerJoin(usersTable, eq(postsTable.user_id, usersTable.id))
      .where(whereCondition);

    const [dataResult, countResult] = await Promise.all([
      query
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

  async getOneById(postID: string): Promise<Post | null> {
    const post = await this.db.query.postsTable.findFirst({
      where: (post, { eq }) => eq(post.id, postID),
    });

    return post ?? null;
  }

  async getAllByUserId(
    userID: string,
    data: SearchParams,
  ): Promise<PaginatedResult<Post>> {
    const { page, search, order } = data;

    const limit = 10;
    const offset = (page - 1) * limit;

    const whereCondition = search ? like(postsTable.text, `%${search}%`) : undefined;

    const query = this.db
      .select()
      .from(postsTable)
      .where(and(eq(postsTable.user_id, userID), whereCondition))
      .$dynamic();

    const queryCount = this.db
      .select({ total: count() })
      .from(postsTable)
      .where(and(eq(postsTable.user_id, userID), whereCondition));

    const [dataResult, countResult] = await Promise.all([
      query
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

  async remove(postID: string): Promise<Post | null> {
    const [deletedPost] = await this.db
      .delete(postsTable)
      .where(eq(postsTable.id, postID))
      .returning();

    return deletedPost ?? null;
  }

  async update(postID: string, data: Partial<Post>): Promise<Post | null> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, createdAt: __, user_id: ___, ...updateData } = data;
    const [updated] = await this.db
      .update(postsTable)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(postsTable.id, postID))
      .returning();

    return updated ?? null;
  }
}
