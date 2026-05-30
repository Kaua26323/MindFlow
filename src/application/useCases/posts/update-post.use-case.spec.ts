import { AppError } from '@/errors/app-error.ts';
import { UpdatePostUseCase } from './update-post.use-case.ts';
import type {
  Post,
  UpdatePostDTO,
  PostRepository,
} from '@/application/repositories/post.repository.ts';

describe('UpdatePostUseCase (Unit)', () => {
  let sut: UpdatePostUseCase;
  let postRepository: PostRepository;

  beforeEach(() => {
    postRepository = {
      create: vi.fn(),
      getAll: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      getOneById: vi.fn(),
      getAllByUserId: vi.fn(),
    };

    sut = new UpdatePostUseCase(postRepository);
  });

  const updateData: UpdatePostDTO = {
    post_id: 'post-1',
    user_id: 'user-1',
    text: 'text updated successfully!',
  };

  const mockExistingPost: Post = {
    id: 'post-1',
    user_id: 'user-1',
    text: 'original and old text',
    createdAt: new Date(),
    updated_at: null,
  };

  const mockUpdatedPost: Post = {
    ...mockExistingPost,
    text: 'text updated successfully!',
    updated_at: new Date(),
  };

  it('should update a post successfully when all conditions are met', async () => {
    vi.mocked(postRepository.getOneById).mockResolvedValue(mockExistingPost);
    vi.mocked(postRepository.update).mockResolvedValue(mockUpdatedPost);

    const result = await sut.execute(updateData);
    const data = {
      user_id: 'user-1',
      text: 'text updated successfully!',
    };

    expect(result).toEqual(mockUpdatedPost);
    expect(postRepository.getOneById).toHaveBeenCalledWith(updateData.post_id);
    expect(postRepository.update).toHaveBeenCalledWith(updateData.post_id, data);
  });

  it('should throw an AppError (404) if the post does not exist', async () => {
    vi.mocked(postRepository.getOneById).mockResolvedValue(null);

    await expect(sut.execute(updateData)).rejects.toThrow(
      new AppError('Post not found!', 404),
    );

    expect(postRepository.update).not.toHaveBeenCalled();
  });

  it('should throw an AppError (401) if the user does not own the post', async () => {
    const unauthorizedData: UpdatePostDTO = {
      post_id: 'post-1',
      user_id: 'user-hacker',
      text: 'text for test',
    };
    vi.mocked(postRepository.getOneById).mockResolvedValue(mockExistingPost);

    await expect(sut.execute(unauthorizedData)).rejects.toThrow(
      new AppError('You do not have permission to update this post', 401),
    );

    expect(postRepository.update).not.toHaveBeenCalled();
  });

  it('should throw an AppError (500) if post repository fails to update the post', async () => {
    vi.mocked(postRepository.getOneById).mockResolvedValue(mockExistingPost);
    vi.mocked(postRepository.update).mockResolvedValue(null);

    await expect(sut.execute(updateData)).rejects.toThrow(
      new AppError('Failed to update the post.', 500),
    );
  });
});
