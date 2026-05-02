import type { NewPost, Post } from '@/infra/db/drizzle/schemas/posts.schema.ts';

interface PostRepository {
  getAll(): Promise<Post[]>;
  remove(postID: string): Promise<Post | null>;
  create(postData: NewPost): Promise<Post | null>;
  getOneById(postID: string): Promise<Post | null>;
  update(postID: string, data: Partial<NewPost>): Promise<Post | null>;
  getAllByUserId(userID: string): Promise<Post[]>;
}

export type { PostRepository };
