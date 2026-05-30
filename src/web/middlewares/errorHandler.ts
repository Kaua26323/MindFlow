import { AppError } from '@/errors/app-error.ts';
import type { Request, Response, NextFunction } from 'express';

function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  // CSRF Errors
  if (err.code === 'EBADCSRFTOKEN') {
    req.flash('errors', 'Session timeout or invalid request. Please try again.');
    const fallback = req.get('Referrer') || '/';
    return res.redirect(fallback);
  }

  // Custom Errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).render('errors/error.handlebars', {
      errorMessage: err.message,
      status: err.statusCode,
    });
  }

  // Unknown Errors
  console.error('🔥 [CRITICAL SERVER ERROR]:', err);

  return res.status(500).render('errors/error.handlebars', {
    errorMessage: 'An internal server error occurred. Please try again later.',
    status: 500,
  });
}

export { errorHandler };
