import { eq } from 'drizzle-orm';
import { postsTable } from '../drizzle/schemas/posts.schema.ts';
import type { DrizzleDatabase } from '../drizzle/connection.ts';
import type { NewPost, Post } from '../drizzle/schemas/posts.schema.ts';
import type { PostRepository } from '@/application/repositories/post.repository.ts';

export class DrizzlePostRepository implements PostRepository {
  private readonly db: DrizzleDatabase;

  constructor(db: DrizzleDatabase) {
    this.db = db;
  }

  async create(postData: NewPost): Promise<Post | null> {
    const [newPost] = await this.db
      .insert(postsTable)
      .values(postData)
      .returning();

    return newPost ?? null;
  }

  async getAll(): Promise<Post[]> {
    const posts = await this.db.query.postsTable.findMany({
      orderBy: (post, { desc }) => desc(post.createdAt),
    });

    return posts ?? [];
  }

  async getOneById(postID: string): Promise<Post | null> {
    const post = await this.db.query.postsTable.findFirst({
      where: (post, { eq }) => eq(post.id, postID),
    });

    return post ?? null;
  }

  async getAllByUserId(userID: string): Promise<Post[]> {
    const posts = await this.db.query.postsTable.findMany({
      where: (post, { eq }) => eq(post.user_id, userID),
    });

    return posts ?? [];
  }

  async remove(postID: string): Promise<Post | null> {
    const [deletedPost] = await this.db
      .delete(postsTable)
      .where(eq(postsTable.id, postID))
      .returning();

    return deletedPost ?? null;
  }

  async update(postID: string, data: Partial<NewPost>): Promise<Post | null> {
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
