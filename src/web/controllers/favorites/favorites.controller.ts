import { AppError } from '@/errors/app-error.ts';

import type { Request, Response } from 'express';
import { AddPostUseCase } from '@/application/useCases/favorites/add-post.use-case.ts';
import type { ValidatorProviderContract } from '@/application/ports/validator.port.ts';
import { RemovePostUseCase } from '@/application/useCases/favorites/remove-post.use-case.ts';
import { GetFavoritesPostsUseCase } from '@/application/useCases/favorites/get-favorites-posts.use-case.ts';

import { favoriteSchema } from '@/infra/web/schemas/favorite.schemas.ts';
import type { FavoriteInput } from '@/infra/web/schemas/favorite.schemas.ts';
import type { SearchParams } from '@/application/repositories/favorites.repository.ts';

export class FavoriteController {
  constructor(
    private readonly addPostUseCase: AddPostUseCase,
    private readonly removePostUseCase: RemovePostUseCase,
    private readonly validator: ValidatorProviderContract,
    private readonly getFavoritesPostsUseCase: GetFavoritesPostsUseCase,
  ) {}

  async savePost(req: Request, res: Response) {
    try {
      const data = {
        user_id: req.session.user?.id,
        post_id: req.body.postID,
      };

      const validatedData = await this.validator.validate<FavoriteInput>(
        favoriteSchema,
        data,
      );

      await this.addPostUseCase.execute(validatedData);

      req.flash('success', 'Post saved successfully!');

      return res.redirect('/');
    } catch (err) {
      if (err instanceof AppError) {
        req.flash('errors', err.message);
        return res.redirect('/');
      }

      req.flash('errors', 'A technical error occurred. Try again later.');

      return res.redirect('/');
    }
  }
  async getsPosts(req: Request, res: Response) {
    const userID = req.session.user?.id;
    if (!userID) throw new AppError('invalid userID!');

    const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
    const limit = 10;

    try {
      const searchData: SearchParams = {
        page: page,
        order: 'DESC',
      };

      const { data, total } = await this.getFavoritesPostsUseCase.execute(
        userID,
        searchData,
      );

      const totalPages = Math.ceil(total / limit);
      const pagesLength = Array.from({ length: totalPages }, (_, i) => ({
        page: i + 1,
        isCurrent: i + 1 === page,
      }));

      return res.render('favorites/favorites.handlebars', {
        favorites: data,
        pagination: {
          pages: pagesLength,
          currentPage: page,
          totalPages: totalPages,
          hasPrev: page > 1,
          hasNext: page < totalPages,
          prevPage: page - 1,
          nextPage: page + 1,
          path: '/favorites',
          order: searchData.order,
        },
      });
    } catch (err) {
      if (err instanceof AppError) {
        req.flash('errors', err.message);
        return res.redirect('/');
      }

      req.flash('errors', 'A technical error occurred. Try again later.');

      return res.redirect('/');
    }
  }
  async removePost(req: Request, res: Response) {
    try {
      const data = {
        user_id: req.session.user?.id,
        post_id: req.params.id,
      };

      const validatedData = await this.validator.validate<FavoriteInput>(
        favoriteSchema,
        data,
      );

      await this.removePostUseCase.execute(validatedData);

      req.flash('success', 'Post removed successfully!');
      return res.redirect('/favorites');
    } catch (err) {
      if (err instanceof AppError) {
        req.flash('errors', err.message);
        return res.redirect('/favorites');
      }

      req.flash('errors', 'A technical error occurred. Try again later.');

      return res.redirect('/favorites');
    }
  }
}
