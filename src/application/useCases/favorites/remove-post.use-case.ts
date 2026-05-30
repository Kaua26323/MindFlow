import { AppError } from '@/errors/app-error.ts';

import type {
  FavoritePost,
  FavoritePostDTO,
  FavoritesPostsRepository,
} from '@/application/repositories/favorites.repository.ts';

export class RemovePostUseCase {
  constructor(private readonly favoriteRepository: FavoritesPostsRepository) {}

  async execute(data: FavoritePostDTO): Promise<FavoritePost> {
    const removed = await this.favoriteRepository.removePost(data);

    if (!removed) {
      throw new AppError('Post record not found or already removed!');
    }

    return removed;
  }
}
