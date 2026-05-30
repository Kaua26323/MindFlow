import { AppError } from '@/errors/app-error.ts';

import type {
  Result,
  SearchParams,
  PaginatedFavorite,
  FavoritesPostsRepository,
} from '@/application/repositories/favorites.repository.ts';

export class GetFavoritesPostsUseCase {
  constructor(private readonly favoriteRepository: FavoritesPostsRepository) {}

  async execute(
    userID: string,
    data: SearchParams,
  ): Promise<PaginatedFavorite<Result>> {
    if (!userID) throw new AppError('UserID is invalid');

    return this.favoriteRepository.getFavoritesPosts(userID, data);
  }
}
