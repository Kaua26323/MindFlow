import type { Request, Response, NextFunction } from 'express';

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user || !req.session.user.id) {
    req.flash('errors', 'Access denied. Please sign in.');

    return req.session.save(() => {
      res.redirect('/login');
    });
  }

  next();
}

export { isAuthenticated };
