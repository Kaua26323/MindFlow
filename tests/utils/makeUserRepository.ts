import { drizzleDatabase } from '@/infra/db/drizzle/connection.ts';
import { DrizzleUserRepository } from '@/infra/db/repositories/drizzle-user.repository.ts';

export function makeUserRepository() {
  const { db, schema } = drizzleDatabase;
  const repository = new DrizzleUserRepository(db);

  const cleanUsersTable = async () => db.delete(schema.usersTable);

  return {
    repository,
    cleanUsersTable,
  };
}
