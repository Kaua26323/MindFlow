import { drizzleDatabase } from '../db/drizzle/connection.ts';
import { Argon2HashAdapter } from '../adapters/argon2-hash.adapter.ts';
import { ZodValidatorAdapter } from '../adapters/zod-validator.adapter.ts';
import { UserController } from '@/web/controllers/users/user.controller.ts';
import { DrizzleUserRepository } from '../db/repositories/drizzle-user.repository.ts';
import { UserLoginUseCase } from '@/application/useCases/users/user-login.use-case.ts';

export function makeUserController(): UserController {
  const { db } = drizzleDatabase;

  const validator = new ZodValidatorAdapter();
  const hashProvider = new Argon2HashAdapter();
  const userRepository = new DrizzleUserRepository(db);
  const userLoginUseCase = new UserLoginUseCase(userRepository, hashProvider);

  return new UserController(userLoginUseCase, validator);
}
