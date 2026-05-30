import { AppError } from '@/errors/app-error.ts';
import { GetPostByIdUseCase } from './get-post-by-id.use-case.ts';
import type {
  PostRepository,
  Post,
} from '@/application/repositories/post.repository.ts';

describe('GetPostByIdUseCase (Unit)', () => {
  let sut: GetPostByIdUseCase;
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

    sut = new GetPostByIdUseCase(postRepository);
  });

  const mockPost: Post = {
    id: 'post-1',
    user_id: 'user-1',
    text: 'Post content for the search by ID test',
    updated_at: null,
    createdAt: new Date(),
  };

  it('should return a post successfully when it exists', async () => {
    vi.mocked(postRepository.getOneById).mockResolvedValue(mockPost);

    const result = await sut.execute('post-1');

    expect(result).toEqual(mockPost);
    expect(postRepository.getOneById).toHaveBeenCalledTimes(1);
    expect(postRepository.getOneById).toHaveBeenCalledWith('post-1');
  });

  it('should throw an AppError (400) if postID is empty', async () => {
    await expect(sut.execute('')).rejects.toThrow(
      new AppError('Invalid postID!', 400),
    );

    expect(postRepository.getOneById).not.toHaveBeenCalled();
  });

  it('should throw an AppError (404) if the post is not found', async () => {
    vi.mocked(postRepository.getOneById).mockResolvedValue(null);

    await expect(sut.execute('invalid-id')).rejects.toThrow(
      new AppError('Post not found!', 404),
    );

    expect(postRepository.getOneById).toHaveBeenCalledWith('invalid-id');
  });
});
