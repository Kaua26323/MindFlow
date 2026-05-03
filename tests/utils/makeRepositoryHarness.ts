import { drizzleDatabase } from '@/infra/db/drizzle/connection.ts';
import { DrizzleUserRepository } from '@/infra/db/repositories/drizzle-user.repository.ts';
import { DrizzlePostRepository } from '@/infra/db/repositories/drizzle-post.repository.ts';
import { DrizzleFavoritesRepository } from '@/infra/db/repositories/drizzle-favorites.repository.ts';

export function makeRepositoryHarness() {
  const { db, schema } = drizzleDatabase;

  const userRepository = new DrizzleUserRepository(db);
  const postRepository = new DrizzlePostRepository(db);
  const favoritesRepository = new DrizzleFavoritesRepository(db);

  const clean = async (tables: ('users' | 'posts' | 'favorites')[]) => {
    if (tables.includes('users')) await db.delete(schema.usersTable);
    if (tables.includes('posts')) await db.delete(schema.postsTable);
    if (tables.includes('favorites'))
      await db.delete(schema.favoritesPostsTable);
  };

  return {
    userRepository,
    postRepository,
    favoritesRepository,
    clean,
    cleanAll: () => clean(['users', 'posts', 'favorites']),
  };
}
