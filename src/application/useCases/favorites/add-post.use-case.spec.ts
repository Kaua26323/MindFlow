import { AddPostUseCase } from './add-post.use-case.ts';
import { AppError } from '@/errors/app-error.ts';
import type { UserRepository } from '@/application/repositories/user.repository.ts';

import type {
  FavoritePost,
  FavoritePostDTO,
  FavoritesPostsRepository,
} from '@/application/repositories/favorites.repository.ts';

describe('AddPostUseCase (Unit)', () => {
  let sut: AddPostUseCase;
  let userRepository: UserRepository;
  let favoriteRepository: FavoritesPostsRepository;

  beforeEach(() => {
    userRepository = {
      create: vi.fn(),
      remove: vi.fn(),
      findById: vi.fn(),
      findByName: vi.fn(),
      findByEmail: vi.fn(),
    };

    favoriteRepository = {
      addPost: vi.fn(),
      removePost: vi.fn(),
      getFavoritesPosts: vi.fn(),
    };

    sut = new AddPostUseCase(userRepository, favoriteRepository);
  });

  const favoriteData: FavoritePostDTO = {
    user_id: 'user-1',
    post_id: 'post-99',
  };

  const mockUser = {
    id: 'user-1',
    name: 'Kaua Souza',
    email: 'Kaua@test.com',
    createdAt: new Date(),
    password: '123434',
    updatedAt: null,
  };

  const mockFavoritePost: FavoritePost = {
    user_id: 'user-1',
    post_id: 'post-99',
    createdAt: new Date(),
  };

  it('should add a post to favorites successfully when all conditions are met', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
    vi.mocked(favoriteRepository.addPost).mockResolvedValue(mockFavoritePost);

    const result = await sut.execute(favoriteData);

    expect(result).toEqual(mockFavoritePost);
    expect(userRepository.findById).toHaveBeenCalledWith(favoriteData.user_id);
    expect(favoriteRepository.addPost).toHaveBeenCalledWith(favoriteData);
  });

  it('should throw an AppError if the user does not exist', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    await expect(sut.execute(favoriteData)).rejects.toThrow(
      new AppError('User not found!'),
    );

    expect(favoriteRepository.addPost).not.toHaveBeenCalled();
  });

  it('should throw an AppError if the favorite repository fails to save the post', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
    vi.mocked(favoriteRepository.addPost).mockResolvedValue(null);

    await expect(sut.execute(favoriteData)).rejects.toThrow(
      new AppError('Failed to save the post!'),
    );
  });
});
