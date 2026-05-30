import { drizzleDatabase } from '../db/drizzle/connection.ts';
import { ZodValidatorAdapter } from '../adapters/zod-validator.adapter.ts';
import { PostController } from '@/web/controllers/posts/post.controller.ts';
import { DrizzlePostRepository } from '../db/repositories/drizzle-post.repository.ts';
import { DrizzleUserRepository } from '../db/repositories/drizzle-user.repository.ts';

import { CreatePostUseCase } from '@/application/useCases/posts/create-post.use-case.ts';
import { GetPostByIdUseCase } from '@/application/useCases/posts/get-post-by-id.use-case.ts';
import { UpdatePostUseCase } from '@/application/useCases/posts/update-post.use-case.ts';
import { RemovePostUseCase } from '@/application/useCases/posts/remove-post.use-case.ts';

export function makePostController(): PostController {
  const { db } = drizzleDatabase;

  const postRepository = new DrizzlePostRepository(db);
  const userRepository = new DrizzleUserRepository(db);
  const zodValidatorAdapter = new ZodValidatorAdapter();

  const createPostUseCase = new CreatePostUseCase(
    userRepository,
    postRepository,
  );
  const getPostByIdUseCase = new GetPostByIdUseCase(postRepository);
  const updatePostUseCase = new UpdatePostUseCase(postRepository);
  const removePostUseCase = new RemovePostUseCase(postRepository);

  return new PostController(
    createPostUseCase,
    getPostByIdUseCase,
    updatePostUseCase,
    removePostUseCase,
    zodValidatorAdapter,
  );
}
