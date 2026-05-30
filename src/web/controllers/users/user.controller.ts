import { AppError } from '@/errors/app-error.ts';

import type { Request, Response } from 'express';
import type { ValidatorProviderContract } from '@/application/ports/validator.port.ts';
import type { UserLoginUseCase } from '@/application/useCases/users/user-login.use-case.ts';

import { userLoginSchema } from '@/infra/web/schemas/user.schemas.ts';
import type { UserLoginInput } from '@/infra/web/schemas/user.schemas.ts';

export class UserController {
  constructor(
    private readonly userLoginUseCase: UserLoginUseCase,
    private readonly validator: ValidatorProviderContract,
  ) {}

  loginPage(req: Request, res: Response) {
    res.render('login.handlebars');
  }

  async signIn(req: Request, res: Response) {
    try {
      const validatedData = await this.validator.validate<UserLoginInput>(
        userLoginSchema,
        req.body,
      );

      const user = await this.userLoginUseCase.execute(validatedData);

      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      req.flash('success', `Welcome again ${user.name}!`);
      return req.session.save(() => {
        res.redirect('/dashboard');
      });
    } catch (err) {
      if (err instanceof AppError) {
        req.flash('errors', err.message);
        return res.redirect('/login');
      }

      req.flash('errors', 'A technical error occurred. Try again later.');
      return res.redirect('/login');
    }
  }

  logOut(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) console.error(err);
      return res.redirect('/');
    });
  }
}
