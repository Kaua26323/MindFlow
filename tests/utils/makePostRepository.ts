import { drizzleDatabase } from '@/infra/db/drizzle/connection.ts';
import { DrizzlePostRepository } from '@/infra/db/repositories/drizzle-post.repository.ts';
import { DrizzleUserRepository } from '@/infra/db/repositories/drizzle-user.repository.ts';

export function makePostRepository() {
  const { db, schema } = drizzleDatabase;
  const postRepository = new DrizzlePostRepository(db);
  const userRepository = new DrizzleUserRepository(db);

  const cleanTables = async () => {
    await db.delete(schema.postsTable);
    await db.delete(schema.usersTable);
  };

  return {
    cleanTables,
    postRepository,
    userRepository,
  };
}
