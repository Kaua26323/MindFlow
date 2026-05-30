import { AppError } from '@/errors/app-error.ts';
import { GetFavoritesPostsUseCase } from './get-favorites-posts.use-case.ts';
import type {
  Result,
  FavoritesPostsRepository,
  PaginatedFavorite,
  SearchParams,
} from '@/application/repositories/favorites.repository.ts';

describe('GetFavoritesPostsUseCase (Unit)', () => {
  let sut: GetFavoritesPostsUseCase;
  let favoriteRepository: FavoritesPostsRepository;

  beforeEach(() => {
    favoriteRepository = {
      addPost: vi.fn(),
      removePost: vi.fn(),
      getFavoritesPosts: vi.fn(),
    };

    sut = new GetFavoritesPostsUseCase(favoriteRepository);
  });

  const userID = 'user-1';

  const mockFavorites: PaginatedFavorite<Result> = {
    data: [
      {
        user_id: 'user-1',
        post_id: 'post-1',
        text: 'My first post!',
        createdAt: new Date(),
      },
      {
        user_id: 'user-1',
        post_id: 'post-2',
        text: 'My second post!',
        createdAt: new Date(),
      },
    ],
    total: 2,
  };

  const searchData: SearchParams = {
    page: 1,
    order: 'DESC',
  };

  it('should return a list of favorite posts successfully', async () => {
    vi.mocked(favoriteRepository.getFavoritesPosts).mockResolvedValue(mockFavorites);

    const result = await sut.execute(userID, searchData);

    expect(result).toEqual(mockFavorites);
    expect(favoriteRepository.getFavoritesPosts).toHaveBeenCalledTimes(1);
    expect(favoriteRepository.getFavoritesPosts).toHaveBeenCalledWith(
      userID,
      searchData,
    );
  });

  it('should return an empty array if the user has no favorite posts', async () => {
    const emptyMock: PaginatedFavorite<Result> = {
      data: [],
      total: 0,
    };

    vi.mocked(favoriteRepository.getFavoritesPosts).mockResolvedValue(emptyMock);

    const result = await sut.execute(userID, searchData);

    expect(result.data).toEqual([]);
    expect(result.total).toEqual(0);
    expect(favoriteRepository.getFavoritesPosts).toHaveBeenCalledWith(
      userID,
      searchData,
    );
  });

  it('should throw an AppError if userID is empty', async () => {
    await expect(sut.execute('', searchData)).rejects.toThrow(
      new AppError('UserID is invalid'),
    );

    expect(favoriteRepository.getFavoritesPosts).not.toHaveBeenCalled();
  });
});
