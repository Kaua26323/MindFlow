import { AppError } from '@/errors/app-error.ts';

import type { Request, Response } from 'express';
import type { SearchParams } from '@/application/repositories/post.repository.ts';

import { GetAllPostsUseCase } from '@/application/useCases/posts/get-all-posts.use-case.ts';
import { GetAllPostsByUserIdUseCase } from '@/application/useCases/posts/get-All-Posts-By-UserId.use-case.ts';

export class MainController {
  constructor(
    private readonly getAllPostsUseCase: GetAllPostsUseCase,
    private readonly getAllPostsByUserIdUseCase: GetAllPostsByUserIdUseCase,
  ) {}

  async homePage(req: Request, res: Response) {
    const userID = req.session.user?.id;
    const query = typeof req.query.search === 'string' ? req.query.search : '';
    const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
    const limit = 10;

    try {
      const searchData: SearchParams = {
        page: page,
        search: query,
        order: req.query.order === 'old' ? 'ASC' : 'DESC',
      };

      const { data, total } = await this.getAllPostsUseCase.execute(
        searchData,
        userID,
      );

      const totalPages = Math.ceil(total / limit);
      const pagesLength = Array.from({ length: totalPages }, (_, i) => ({
        page: i + 1,
        isCurrent: i + 1 === page,
      }));

      return res.render('home.handlebars', {
        allPosts: data,
        postQty: data.length,
        order: searchData.order,
        search: searchData.search,
        pagesLength: [1, 2, 3, 4, 5, 6, 7, 8, 9],

        pagination: {
          pages: pagesLength,
          currentPage: page,
          totalPages: totalPages,
          hasPrev: page > 1,
          hasNext: page < totalPages,
          prevPage: page - 1,
          nextPage: page + 1,
          path: '/',
          order: searchData.order,
          search: searchData.search,
        },
      });
    } catch (err) {
      if (err instanceof AppError) {
        req.flash('errors', err.message);
        return res.render('home.handlebars', { allPosts: [] });
      }

      req.flash('errors', 'A technical error occurred.');
      return res.render('home.handlebars', { allPosts: [] });
    }
  }

  async dashboardPage(req: Request, res: Response) {
    const userID = req.session.user?.id;
    if (!userID) throw new AppError('invalid userID!');

    const query = typeof req.query.search === 'string' ? req.query.search : '';
    const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
    const limit = 10;

    try {
      const searchData: SearchParams = {
        page: page,
        search: query,
        order: 'DESC',
      };

      const { data, total } = await this.getAllPostsByUserIdUseCase.execute(
        userID,
        searchData,
      );

      const totalPages = Math.ceil(total / limit);
      const pagesLength = Array.from({ length: totalPages }, (_, i) => ({
        page: i + 1,
        isCurrent: i + 1 === page,
      }));

      return res.render('dashboard/dashboard.handlebars', {
        userPosts: data,
        order: searchData.order,
        search: searchData.search,
        postQty: data.length,
        totalPosts: total,

        pagination: {
          pages: pagesLength,
          currentPage: page,
          totalPages: totalPages,
          hasPrev: page > 1,
          hasNext: page < totalPages,
          prevPage: page - 1,
          nextPage: page + 1,
          path: '/dashboard',
          order: searchData.order,
          search: searchData.search,
        },
      });
    } catch (err) {
      if (err instanceof AppError) {
        req.flash('errors', err.message);
        return res.render('dashboard/dashboard.handlebars', { userPosts: [] });
      }

      req.flash('errors', 'A technical error occurred.');
      return res.render('dashboard/dashboard.handlebars', { userPosts: [] });
    }
  }
}
