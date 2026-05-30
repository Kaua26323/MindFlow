import type { Request, Response } from 'express';

function notFoundHandler(req: Request, res: Response) {
  res.render('errors/404.handlebars');
}

export { notFoundHandler };
