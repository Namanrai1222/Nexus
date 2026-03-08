import { Response } from 'express';
import { prisma } from '../config/db';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth.middleware';
import cloudinary from '../config/cloudinary';

/**
 * GET /api/v1/users/:username
 * Get a user's public profile
 */
export const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const username = req.params.username as string;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
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

/**
 * GET /api/v1/users/:username/posts
 * Get a user's posts
 */
export const getUserPosts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const username = req.params.username as string;
  const { page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new ApiError(404, 'User not found');

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: user.id, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
      include: {
        community: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true, votes: true } },
      },
    }),
    prisma.post.count({ where: { authorId: user.id, isDeleted: false } }),
  ]);

  res.status(200).json(
    new ApiResponse(200, 'User posts fetched', {
      posts,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    })
  );
});

/**
 * PUT /api/v1/users/profile
 * Update the authenticated user's profile
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { displayName, bio } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(displayName !== undefined && { displayName }),
      ...(bio !== undefined && { bio }),
    },
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      role: true,
      impactScore: true,
    },
  });

  res.status(200).json(new ApiResponse(200, 'Profile updated', user));
});

/**
 * POST /api/v1/users/avatar
 * Upload a new avatar (Cloudinary)
 */
export const uploadAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'No image file provided');
  }

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'nexus/avatars',
    width: 256,
    height: 256,
    crop: 'fill',
    gravity: 'face',
  });

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { avatarUrl: result.secure_url },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
    },
  });

  res.status(200).json(new ApiResponse(200, 'Avatar updated', user));
});
