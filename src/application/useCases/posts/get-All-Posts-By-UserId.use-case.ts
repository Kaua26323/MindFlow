import { AppError } from '@/errors/app-error.ts';

import type {
  Post,
  SearchParams,
  PostRepository,
  PaginatedResult,
} from '@/application/repositories/post.repository.ts';

export class GetAllPostsByUserIdUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(userID: string, data: SearchParams): Promise<PaginatedResult<Post>> {
    if (!userID) throw new AppError('Invalid userID!', 400);

    return this.postRepository.getAllByUserId(userID, data);
  }
}
