import { usersTable } from '@/infra/db/drizzle/schemas/users.schema.ts';

import type { NewUser, User } from '../drizzle/schemas/users.schema.ts';
import type { DrizzleDatabase } from '@/infra/db/drizzle/connection.ts';
import type { UserRepository } from '@/application/repositories/user.repository.ts';
import { eq } from 'drizzle-orm';

export class DrizzleUserRepository implements UserRepository {
  private readonly db: DrizzleDatabase;

  constructor(db: DrizzleDatabase) {
    this.db = db;
  }

  async create(userData: NewUser): Promise<User | null> {
    const [newUser] = await this.db
      .insert(usersTable)
      .values(userData)
      .returning();

    return newUser ?? null;
  }

  async remove(userID: string): Promise<User | null> {
    const [deletedUser] = await this.db
      .delete(usersTable)
      .where(eq(usersTable.id, userID))
      .returning();

    return deletedUser ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db.query.usersTable.findFirst({
      where: (user, { eq }) => eq(user.email, email),
    });

    return user ?? null;
  }

  async findByName(name: string): Promise<User | null> {
    const user = await this.db.query.usersTable.findFirst({
      where: (user, { eq }) => eq(user.name, name),
    });

    return user ?? null;
  }
}
