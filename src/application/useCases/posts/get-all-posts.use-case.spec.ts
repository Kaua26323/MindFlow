import { GetAllPostsUseCase } from './get-all-posts.use-case.ts';

import type {
  PaginatedResult,
  PostRepository,
  PostWithUserName,
  SearchParams,
} from '@/application/repositories/post.repository.ts';

describe('GetAllPostsUseCase (Unit)', () => {
  let sut: GetAllPostsUseCase;
  let postRepository: PostRepository;

  beforeEach(() => {
    postRepository = {
      create: vi.fn(),
      getAll: vi.fn(),
      getAllByUserId: vi.fn(),
      getOneById: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    sut = new GetAllPostsUseCase(postRepository);
  });

  const searchParams: SearchParams = {
    page: 1,
    order: 'DESC',
    search: 'clean architecture',
  };

  const mockPosts: PaginatedResult<PostWithUserName> = {
    data: [
      {
        id: 'post-1',
        text: 'Exploring software design patterns.',
        userID: 'user-1',
        userName: 'John Doe',
        createdAt: new Date(),
        isFavorite: true,
      },
      {
        id: 'post-2',
        text: 'Writing unit tests with Vitest.',
        userID: 'user-2',
        userName: 'Jane Doe',
        createdAt: new Date(),
        isFavorite: false,
      },
    ],
    total: 2,
  };

  it('should return posts successfully when search params and userID are provided', async () => {
    const userID = 'user-1';
    vi.mocked(postRepository.getAll).mockResolvedValue(mockPosts);

    const result = await sut.execute(searchParams, userID);

    expect(result).toEqual(mockPosts);
    expect(postRepository.getAll).toHaveBeenCalledTimes(1);
    expect(postRepository.getAll).toHaveBeenCalledWith(searchParams, userID);
  });

  it('should return posts successfully when userID is omitted', async () => {
    vi.mocked(postRepository.getAll).mockResolvedValue(mockPosts);

    const result = await sut.execute(searchParams);

    expect(result).toEqual(mockPosts);
    expect(postRepository.getAll).toHaveBeenCalledTimes(1);
    expect(postRepository.getAll).toHaveBeenCalledWith(searchParams, undefined);
  });

  it('should return a empty array if does not have posts', async () => {
    vi.mocked(postRepository.getAll).mockResolvedValue({ data: [], total: 0 });

    const result = await sut.execute(searchParams, undefined);
    expect(result.total).toBe(0);
    expect(result.data).toEqual([]);
    expect(result.data).toHaveLength(0);
    expect(postRepository.getAll).toHaveBeenCalled();
  });
});
