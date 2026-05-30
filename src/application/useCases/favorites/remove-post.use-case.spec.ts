import { AppError } from '@/errors/app-error.ts';
import { RemovePostUseCase } from './remove-post.use-case.ts';

import type {
  FavoritePost,
  FavoritePostDTO,
  FavoritesPostsRepository,
} from '@/application/repositories/favorites.repository.ts';

describe('RemovePostUseCase (Unit)', () => {
  let sut: RemovePostUseCase;
  let favoriteRepository: FavoritesPostsRepository;

  beforeEach(() => {
    favoriteRepository = {
      addPost: vi.fn(),
      removePost: vi.fn(),
      getFavoritesPosts: vi.fn(),
    };

    sut = new RemovePostUseCase(favoriteRepository);
  });

  const favoriteData: FavoritePostDTO = {
    user_id: 'user-1',
    post_id: 'post-99',
  };

  const mockRemovedFavorite: FavoritePost = {
    user_id: 'user-1',
    post_id: 'post-99',
    createdAt: new Date(),
  };

  it('should remove a favorite post record successfully', async () => {
    vi.mocked(favoriteRepository.removePost).mockResolvedValue(mockRemovedFavorite);

    const result = await sut.execute(favoriteData);

    expect(result).toEqual(mockRemovedFavorite);
    expect(favoriteRepository.removePost).toHaveBeenCalledTimes(1);
    expect(favoriteRepository.removePost).toHaveBeenCalledWith(favoriteData);
  });

  it('should throw an AppError if the post record is not found or already removed', async () => {
    vi.mocked(favoriteRepository.removePost).mockResolvedValue(null);

    await expect(sut.execute(favoriteData)).rejects.toThrow(
      new AppError('Post record not found or already removed!'),
    );
  });
});
