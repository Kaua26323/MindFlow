import { AppError } from '@/errors/app-error.ts';

import type { UserRepository } from '@/application/repositories/user.repository.ts';
import type {
  Post,
  CreatePostDTO,
  PostRepository,
} from '@/application/repositories/post.repository.ts';

export class CreatePostUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly postRepository: PostRepository,
  ) {}

  async execute(postData: CreatePostDTO): Promise<Post> {
    const userExists = await this.userRepository.findById(postData.user_id);
    if (!userExists) throw new AppError('userID not found!', 401);

    const newPost = await this.postRepository.create(postData);
    if (!newPost) throw new AppError('Failed to create the post.', 500);

    return newPost;
  }
}
