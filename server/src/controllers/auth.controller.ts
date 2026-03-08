import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/db';

// Cookie options for refresh token
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

/**
 * POST /api/v1/auth/register
 * Register a new user account
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, displayName } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    throw new ApiError(400, 'Username, email, and password are required');
  }
  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }
  if (username.length < 3 || username.length > 30) {
    throw new ApiError(400, 'Username must be between 3 and 30 characters');
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    throw new ApiError(400, 'Username can only contain letters, numbers, underscores, and hyphens');
  }

  const result = await authService.register({ username, email, password, displayName });

  res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(201).json(
    new ApiResponse(201, 'Registration successful', {
      user: result.user,
      accessToken: result.accessToken,
    })
  );
});

/**
 * POST /api/v1/auth/login
 * Authenticate user and return tokens
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const result = await authService.login({ email, password });

  res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(200).json(
    new ApiResponse(200, 'Login successful', {
      user: result.user,
      accessToken: result.accessToken,
    })
  );
});

/**
 * POST /api/v1/auth/refresh
 * Refresh the access token using the refresh token cookie
 */
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new ApiError(401, 'Refresh token missing');
  }

  const tokens = await authService.refreshAccessToken(token);

  // Set new refresh token cookie (rotation)
  res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(200).json(
    new ApiResponse(200, 'Token refreshed', {
      accessToken: tokens.accessToken,
    })
  );
});

/**
 * POST /api/v1/auth/logout
 * Clear refresh token and cookie
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  await authService.logout(token);

  res.clearCookie('refreshToken', { path: '/' });
  res.status(200).json(new ApiResponse(200, 'Logged out successfully'));
});

/**
 * POST /api/v1/auth/logout-all
 * Revoke all refresh tokens for the authenticated user
 */
export const logoutAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  await authService.logoutAll(req.user!.id);

  res.clearCookie('refreshToken', { path: '/' });
  res.status(200).json(new ApiResponse(200, 'Logged out from all devices'));
});

/**
 * GET /api/v1/auth/me
 * Get the currently authenticated user's profile
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      role: true,
      impactScore: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          comments: true,
          communities: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(new ApiResponse(200, 'User profile fetched', user));
});
