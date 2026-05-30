import { drizzleDatabase } from '../db/drizzle/connection.ts';
import { MainController } from '@/web/controllers/main.controller.ts';
import { DrizzlePostRepository } from '../db/repositories/drizzle-post.repository.ts';

import { GetAllPostsUseCase } from '@/application/useCases/posts/get-all-posts.use-case.ts';
import { GetAllPostsByUserIdUseCase } from '@/application/useCases/posts/get-All-Posts-By-UserId.use-case.ts';

export function makeMainController(): MainController {
  const { db } = drizzleDatabase;

  const postRepository = new DrizzlePostRepository(db);
  const getAllPostsUseCase = new GetAllPostsUseCase(postRepository);
  const getAllPostsByUserIdUseCase = new GetAllPostsByUserIdUseCase(postRepository);

  return new MainController(getAllPostsUseCase, getAllPostsByUserIdUseCase);
}
