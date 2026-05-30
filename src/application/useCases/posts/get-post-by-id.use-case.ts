import { AppError } from '@/errors/app-error.ts';
import type {
  Post,
  PostRepository,
} from '@/application/repositories/post.repository.ts';

export class GetPostByIdUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(postID: string): Promise<Post> {
    if (!postID) throw new AppError('Invalid postID!', 400);

    const post = await this.postRepository.getOneById(postID);
    if (!post) throw new AppError('Post not found!', 404);

    return post;
  }
}
