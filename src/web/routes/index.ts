import { Router } from 'express';
import { mainRoutes } from './main-router.ts';
import { userRoutes } from './user-routes.ts';
import { postRoutes } from './post-routes.ts';
import { favoriteRoutes } from './favoriteRoutes.ts';

const routes = Router();

routes.use(mainRoutes);
routes.use(userRoutes);
routes.use(postRoutes);
routes.use(favoriteRoutes);

export { routes };
