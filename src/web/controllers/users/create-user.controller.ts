import { AppError } from '@/errors/app-error.ts';

import type { Request, Response } from 'express';
import type { ValidatorProviderContract } from '@/application/ports/validator.port.ts';
import type { CreateUserUseCase } from '@/application/useCases/users/create-user.use-case.ts';

import { createUserSchema } from '@/infra/web/schemas/user.schemas.ts';
import type { CreateUserInput } from '@/infra/web/schemas/user.schemas.ts';

export class CreateUserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly validator: ValidatorProviderContract,
  ) {}

  createUserPage(req: Request, res: Response) {
    res.render('create-user.handlebars');
  }

  async createUser(req: Request, res: Response) {
    try {
      const validatedData = await this.validator.validate<CreateUserInput>(
        createUserSchema,
        req.body,
      );

      const newUser = await this.createUserUseCase.execute(validatedData);

      req.session.user = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      };

      req.flash('success', 'Account created successfully!');

      return req.session.save(() => {
        res.redirect('/dashboard');
      });
    } catch (err) {
      if (err instanceof AppError) {
        req.flash('errors', err.message);
        return res.redirect('/register');
      }

      req.flash('errors', 'A technical error occurred. Try again later.');
      return res.redirect('/register');
    }
  }
}
