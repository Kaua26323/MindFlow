import { drizzleDatabase } from '../db/drizzle/connection.ts';
import { Argon2HashAdapter } from '../adapters/argon2-hash.adapter.ts';
import { ZodValidatorAdapter } from '../adapters/zod-validator.adapter.ts';
import { DrizzleUserRepository } from '../db/repositories/drizzle-user.repository.ts';
import { CreateUserUseCase } from '@/application/useCases/users/create-user.use-case.ts';
import { CreateUserController } from '@/web/controllers/users/create-user.controller.ts';

export function makeCreateUserController(): CreateUserController {
  const { db } = drizzleDatabase;

  const validator = new ZodValidatorAdapter();
  const hashProvider = new Argon2HashAdapter();
  const userRepository = new DrizzleUserRepository(db);
  const createUserUseCase = new CreateUserUseCase(userRepository, hashProvider);

  return new CreateUserController(createUserUseCase, validator);
}
