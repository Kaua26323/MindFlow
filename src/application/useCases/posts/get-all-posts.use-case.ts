import type {
  SearchParams,
  PostRepository,
  PaginatedResult,
  PostWithUserName,
} from '@/application/repositories/post.repository.ts';

export class GetAllPostsUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(
    data: SearchParams,
    userID?: string,
  ): Promise<PaginatedResult<PostWithUserName>> {
    return this.postRepository.getAll(data, userID);
  }
}
