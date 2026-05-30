import type { Request, Response, NextFunction } from 'express';

function catchFlashMessage(req: Request, res: Response, next: NextFunction) {
  res.locals.errors = req.flash('errors');
  res.locals.success = req.flash('success');
  res.locals.session = req.session;

  next();
}

export { catchFlashMessage };
