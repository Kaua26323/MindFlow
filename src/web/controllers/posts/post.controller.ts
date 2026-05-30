import { AppError } from '@/errors/app-error.ts';

import type { Request, Response } from 'express';
import type { ValidatorProviderContract } from '@/application/ports/validator.port.ts';

import type { CreatePostUseCase } from '@/application/useCases/posts/create-post.use-case.ts';
import type { GetPostByIdUseCase } from '@/application/useCases/posts/get-post-by-id.use-case.ts';
import type { UpdatePostUseCase } from '@/application/useCases/posts/update-post.use-case.ts';
import type { RemovePostUseCase } from '@/application/useCases/posts/remove-post.use-case.ts';

import {
  createPostSchema,
  updatePostSchema,
  removePostSchema,
} from '@/infra/web/schemas/post.schemas.ts';

import type {
  CreatePostInput,
  UpdatePostInput,
  RemovePostInput,
} from '@/infra/web/schemas/post.schemas.ts';

export class PostController {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly getPostByIdUseCase: GetPostByIdUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly removePostUseCase: RemovePostUseCase,
    private readonly validator: ValidatorProviderContract,
  ) {}

  async createPostPage(req: Request, res: Response) {
    res.render('dashboard/create.handlebars');
  }

  async createPost(req: Request, res: Response) {
    const userID = req.session.user?.id;

    try {
      const validatedData = await this.validator.validate<CreatePostInput>(
        createPostSchema,
        {
          text: req.body.text,
          user_id: userID,
        },
      );

      await this.createPostUseCase.execute(validatedData);

      req.flash('success', 'post created successfully!');
      return res.redirect('/dashboard');
    } catch (err) {
      if (err instanceof AppError) {
        req.flash('errors', err.message);
        return res.redirect('/new-post');
      }

      req.flash('errors', 'A technical error occurred. Try again later.');
      return res.redirect('/new-post');
    }
  }

  async updatePostPage(req: Request, res: Response) {
    try {
      const postID = typeof req.params.id === 'string' ? req.params.id : '';
      const post = await this.getPostByIdUseCase.execute(postID);

      res.render('dashboard/edit.handlebars', {
        post,
      });
    } catch (err) {
      if (err instanceof AppError) {
        req.flash('errors', err.message);
        return res.redirect('/dashboard');
      }

      req.flash('errors', 'A technical error occurred. Try again later.');
      return res.redirect('/dashboard');
    }
  }

  async updatePost(req: Request, res: Response) {
    const userID = req.session.user?.id;
    const { post_id, text } = req.body;

    try {
      const ValidatedData = await this.validator.validate<UpdatePostInput>(
        updatePostSchema,
        { post_id: post_id, user_id: userID, text: text },
      );

      await this.updatePostUseCase.execute(ValidatedData);
      req.flash('success', 'post updated successfully!');
      return res.redirect('/dashboard');
    } catch (err) {
      if (err instanceof AppError) {
        req.flash('errors', err.message);
        return res.redirect('/dashboard');
      }

      req.flash('errors', 'A technical error occurred. Try again later.');
      return res.redirect('/dashboard');
    }
  }

  async removePost(req: Request, res: Response) {
    const postID = req.params.id;
    const userID = req.session.user?.id;

    try {
      const validatedData = await this.validator.validate<RemovePostInput>(
        removePostSchema,
        { post_id: postID, user_id: userID },
      );

      await this.removePostUseCase.execute(validatedData);

      req.flash('success', 'Post was deleted successfully');
      return res.redirect('/dashboard');
    } catch (err) {
      if (err instanceof AppError) {
        req.flash('errors', err.message);
        return res.redirect('/dashboard');
      }

      req.flash('errors', 'A technical error occurred. Try again later.');
      return res.redirect('/dashboard');
    }
  }
}
