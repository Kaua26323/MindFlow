import { AppError } from '@/errors/app-error.ts';
import type {
  Post,
  UpdatePostDTO,
  PostRepository,
} from '@/application/repositories/post.repository.ts';

export class UpdatePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(data: UpdatePostDTO): Promise<Post> {
    const post = await this.postRepository.getOneById(data.post_id);

    if (!post) throw new AppError('Post not found!', 404);

    if (post?.user_id !== data.user_id) {
      throw new AppError('You do not have permission to update this post', 401);
    }

    const updatedData = {
      user_id: data.user_id,
      text: data.text,
    };

    const updatedPost = await this.postRepository.update(data.post_id, updatedData);

    if (!updatedPost) throw new AppError('Failed to update the post.', 500);

    return updatedPost;
  }
}
