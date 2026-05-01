import type { NewUser, User } from '@/infra/db/drizzle/schemas/users.schema.ts';

interface UserRepository {
  create(userData: NewUser): Promise<User | null>;
  remove(userID: string): Promise<User | null>;
  findByName(name: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

export type { UserRepository };
