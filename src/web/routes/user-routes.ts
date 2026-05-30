import { Router } from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.ts';
import { makeUserController } from '@/infra/factories/makeUserController.ts';
import { makeCreateUserController } from '@/infra/factories/makeCreateUserController.ts';

const userController = makeUserController();
const createUserController = makeCreateUserController();

const userRoutes = Router();

userRoutes.get('/login', (req, res) => userController.loginPage(req, res));
userRoutes.post('/signin', (req, res) => userController.signIn(req, res));
userRoutes.get('/logout', isAuthenticated, (req, res) =>
  userController.logOut(req, res),
);

userRoutes.get('/register', (req, res) =>
  createUserController.createUserPage(req, res),
);
userRoutes.post('/create-user', (req, res) =>
  createUserController.createUser(req, res),
);

export { userRoutes };
