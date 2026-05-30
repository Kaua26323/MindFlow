import { Router } from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.ts';
import { makeFavoriteController } from '@/infra/factories/makeFavoriteController.ts';

const favoriteRoutes = Router();
const favoriteController = makeFavoriteController();

favoriteRoutes.get('/favorites', isAuthenticated, (req, res) =>
  favoriteController.getsPosts(req, res),
);

favoriteRoutes.post('/favorite/add', isAuthenticated, (req, res) =>
  favoriteController.savePost(req, res),
);

favoriteRoutes.delete('/favorite/remove/:id', isAuthenticated, (req, res) =>
  favoriteController.removePost(req, res),
);

export { favoriteRoutes };
