import { drizzleDatabase } from '../db/drizzle/connection.ts';

import { AddPostUseCase } from '@/application/useCases/favorites/add-post.use-case.ts';
import { RemovePostUseCase } from '@/application/useCases/favorites/remove-post.use-case.ts';
import { GetFavoritesPostsUseCase } from '@/application/useCases/favorites/get-favorites-posts.use-case.ts';

import { ZodValidatorAdapter } from '../adapters/zod-validator.adapter.ts';
import { DrizzleUserRepository } from '../db/repositories/drizzle-user.repository.ts';
import { DrizzleFavoritesRepository } from '../db/repositories/drizzle-favorites.repository.ts';
import { FavoriteController } from '@/web/controllers/favorites/favorites.controller.ts';

export function makeFavoriteController(): FavoriteController {
  const { db } = drizzleDatabase;

  const validator = new ZodValidatorAdapter();
  const userRepository = new DrizzleUserRepository(db);
  const favoritesRepository = new DrizzleFavoritesRepository(db);

  const addPostUseCase = new AddPostUseCase(userRepository, favoritesRepository);
  const removePostUseCase = new RemovePostUseCase(favoritesRepository);
  const getFavoritesPostsUseCase = new GetFavoritesPostsUseCase(favoritesRepository);

  return new FavoriteController(
    addPostUseCase,
    removePostUseCase,
    validator,
    getFavoritesPostsUseCase,
  );
}
