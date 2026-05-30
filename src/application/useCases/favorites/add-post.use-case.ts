import { AppError } from '@/errors/app-error.ts';
import type { UserRepository } from '@/application/repositories/user.repository.ts';

import type {
  FavoritePost,
  FavoritePostDTO,
  FavoritesPostsRepository,
} from '@/application/repositories/favorites.repository.ts';

export class AddPostUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly favoriteRepository: FavoritesPostsRepository,
  ) {}

  async execute(data: FavoritePostDTO): Promise<FavoritePost> {
    const userExists = await this.userRepository.findById(data.user_id);
    if (!userExists) throw new AppError('User not found!');

    const favorite = await this.favoriteRepository.addPost(data);

    if (!favorite) throw new AppError('Failed to save the post!');

    return favorite;
  }
}
