import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(
      new ApiResponse(err.statusCode, err.message, err.errors.length ? err.errors : null)
    );
    return;
  }

  console.error('[Error]', err);

  res.status(500).json(
    new ApiResponse(500, process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message)
  );
};
