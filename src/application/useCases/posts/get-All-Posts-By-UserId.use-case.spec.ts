import { AppError } from '@/errors/app-error.ts';
import { GetAllPostsByUserIdUseCase } from './get-All-Posts-By-UserId.use-case.ts';
import type {
  PaginatedResult,
  Post,
  PostRepository,
  SearchParams,
} from '@/application/repositories/post.repository.ts';

describe('GetAllPostsByUserIdUseCase (Unit)', () => {
  let sut: GetAllPostsByUserIdUseCase;
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

    sut = new GetAllPostsByUserIdUseCase(postRepository);
  });

  const searchParams: SearchParams = {
    page: 1,
    order: 'DESC',
    search: 'clean architecture',
  };

  const mockPosts: PaginatedResult<Post> = {
    data: [
      {
        id: 'post-1',
        text: 'Working with Drizzle ORM in Node.js',
        user_id: 'user-1',
        createdAt: new Date(),
        updated_at: null,
      },
      {
        id: 'post-2',
        text: 'Writing clean unit tests',
        user_id: 'user-1',
        createdAt: new Date(),
        updated_at: null,
      },
    ],
    total: 2,
  };

  it('should return posts successfully when a valid userID is provided', async () => {
    vi.mocked(postRepository.getAllByUserId).mockResolvedValue(mockPosts);
    const result = await sut.execute('user-1', searchParams);

    expect(result).toEqual(mockPosts);
    expect(postRepository.getAllByUserId).toHaveBeenCalledTimes(1);
    expect(postRepository.getAllByUserId).toHaveBeenCalledWith(
      'user-1',
      searchParams,
    );
  });

  it('should throw an AppError (400) if userID is empty', async () => {
    await expect(sut.execute('', searchParams)).rejects.toThrow(
      new AppError('Invalid userID!', 400),
    );

    expect(postRepository.getAllByUserId).not.toHaveBeenCalled();
  });
});
