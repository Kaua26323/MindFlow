import { AppError } from '@/errors/app-error.ts';
import type {
  Post,
  PostRepository,
  RemovePostDTO,
} from '@/application/repositories/post.repository.ts';

export class RemovePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(data: RemovePostDTO): Promise<Post> {
    const { post_id, user_id } = data;

    if (!post_id) throw new AppError('Invalid postID!', 400);

    const post = await this.postRepository.getOneById(post_id);

    if (!post) throw new AppError('Post not found', 404);

    if (post.user_id !== user_id) {
      throw new AppError('You do not have permission to delete this post', 401);
    }

    const removed = await this.postRepository.remove(post_id);
    if (!removed) throw new AppError('Failed to remove the post!', 500);

    return removed;
  }
}
