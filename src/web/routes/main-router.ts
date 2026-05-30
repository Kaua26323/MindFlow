import { Router } from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.ts';
import { makeMainController } from '@/infra/factories/makeMainController.ts';

const mainRoutes = Router();
const mainController = makeMainController();

mainRoutes.get('/', (req, res) => mainController.homePage(req, res));

mainRoutes.get('/dashboard', isAuthenticated, (req, res) =>
  mainController.dashboardPage(req, res),
);

export { mainRoutes };
