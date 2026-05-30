import { AppError } from '@/errors/app-error.ts';
import { RemovePostUseCase } from './remove-post.use-case.ts';
import type {
  Post,
  PostRepository,
} from '@/application/repositories/post.repository.ts';

describe('RemovePostUseCase (Unit)', () => {
  let sut: RemovePostUseCase;
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

    sut = new RemovePostUseCase(postRepository);
  });

  const removeData = {
    post_id: 'post-1',
    user_id: 'user-1',
  };

  const mockPost: Post = {
    id: 'post-1',
    user_id: 'user-1',
    text: 'This post will be removed',
    createdAt: new Date(),
    updated_at: null,
  };

  it('should remove a post successfully when all conditions are met', async () => {
    vi.mocked(postRepository.getOneById).mockResolvedValue(mockPost);
    vi.mocked(postRepository.remove).mockResolvedValue(mockPost);

    const result = await sut.execute(removeData);

    expect(result).toEqual(mockPost);
    expect(postRepository.getOneById).toHaveBeenCalledWith(removeData.post_id);
    expect(postRepository.remove).toHaveBeenCalledWith(removeData.post_id);
  });

  it('should throw an AppError (400) if postID is empty', async () => {
    const wrongData = {
      post_id: '',
      user_id: 'user-1',
    };

    await expect(sut.execute(wrongData)).rejects.toThrow(
      new AppError('Invalid postID!', 400),
    );

    expect(postRepository.getOneById).not.toHaveBeenCalled();
    expect(postRepository.remove).not.toHaveBeenCalled();
  });

  it('should throw an AppError (404) if the post does not exist', async () => {
    vi.mocked(postRepository.getOneById).mockResolvedValue(null);

    await expect(sut.execute(removeData)).rejects.toThrow(
      new AppError('Post not found', 404),
    );

    expect(postRepository.remove).not.toHaveBeenCalled();
  });

  it('should throw an AppError (401) if the user does not have permission to delete the post', async () => {
    vi.mocked(postRepository.getOneById).mockResolvedValue(mockPost);

    const wrongData = {
      post_id: 'post-1',
      user_id: 'user-hacker',
    };

    await expect(sut.execute(wrongData)).rejects.toThrow(
      new AppError('You do not have permission to delete this post', 401),
    );

    expect(postRepository.remove).not.toHaveBeenCalled();
  });

  it('should throw an AppError (500) if post repository fails to remove the post', async () => {
    vi.mocked(postRepository.getOneById).mockResolvedValue(mockPost);
    vi.mocked(postRepository.remove).mockResolvedValue(null);

    await expect(sut.execute(removeData)).rejects.toThrow(
      new AppError('Failed to remove the post!', 500),
    );
  });
});
