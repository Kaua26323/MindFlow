import { Router } from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.ts';
import { makePostController } from '@/infra/factories/makePostController.ts';

const postController = makePostController();

const postRoutes = Router();

postRoutes.get('/new-post', isAuthenticated, (req, res) =>
  postController.createPostPage(req, res),
);

postRoutes.post('/create-post', isAuthenticated, (req, res) =>
  postController.createPost(req, res),
);

postRoutes.get('/edit-post/:id', isAuthenticated, (req, res) =>
  postController.updatePostPage(req, res),
);

postRoutes.post('/update-post', isAuthenticated, (req, res) =>
  postController.updatePost(req, res),
);

postRoutes.delete('/delete-post/:id', isAuthenticated, (req, res) =>
  postController.removePost(req, res),
);

export { postRoutes };
