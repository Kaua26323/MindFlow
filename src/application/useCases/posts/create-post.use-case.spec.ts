import { AppError } from '@/errors/app-error.ts';
import { CreatePostUseCase } from './create-post.use-case.ts';
import type { PostRepository } from '@/application/repositories/post.repository.ts';
import type { UserRepository } from '@/application/repositories/user.repository.ts';

describe('CreatePostUseCase (Unit)', () => {
  let sut: CreatePostUseCase;
  let postRepository: PostRepository;
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByName: vi.fn(),
      findByEmail: vi.fn(),
      remove: vi.fn(),
    };

    postRepository = {
      create: vi.fn(),
      getAll: vi.fn(),
      getAllByUserId: vi.fn(),
      getOneById: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    sut = new CreatePostUseCase(userRepository, postRepository);
  });

  const postData = {
    user_id: 'user-1',
    text: 'generic text for test',
  };

  const mockUser = {
    id: 'user-1',
    name: 'Kauan souza',
    email: 'kaua@test.com',
    password: 'strong_password',
    createdAt: new Date(),
    updatedAt: null,
  };

  const mockPost = {
    id: 'post-1',
    user_id: 'user-1',
    text: 'generic text for test',
    updated_at: null,
    createdAt: new Date(),
  };

  it('should create a post successfully', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
    vi.mocked(postRepository.create).mockResolvedValue(mockPost);

    const result = await sut.execute(postData);

    expect(result).toEqual(mockPost);
    expect(userRepository.findById).toHaveBeenCalledWith('user-1');
    expect(postRepository.create).toHaveBeenCalledWith(postData);
  });

  it('should throw an AppError (401) if the user does not exist', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    await expect(sut.execute(postData)).rejects.toThrow(
      new AppError('userID not found!', 401),
    );

    expect(postRepository.create).not.toHaveBeenCalled();
  });

  it('should throw an AppError (500) if post repository fails to create the post', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
    vi.mocked(postRepository.create).mockResolvedValue(null);

    await expect(sut.execute(postData)).rejects.toThrow(
      new AppError('Failed to create the post.', 500),
    );
  });
});
