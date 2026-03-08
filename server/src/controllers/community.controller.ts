import { Response } from 'express';
import { prisma } from '../config/db';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth.middleware';
import slugify from 'slugify';

/**
 * POST /api/v1/communities
 * Create a new community
 */
export const createCommunity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description, type, isPrivate } = req.body;

  if (!name) {
    throw new ApiError(400, 'Community name is required');
  }

  if (name.length < 3 || name.length > 50) {
    throw new ApiError(400, 'Community name must be between 3 and 50 characters');
  }

  const slug = slugify(name, { lower: true, strict: true });

  // Check if slug already exists
  const existing = await prisma.community.findUnique({ where: { slug } });
  if (existing) {
    throw new ApiError(409, 'A community with this name already exists');
  }

  const community = await prisma.community.create({
    data: {
      name,
      slug,
      description,
      type: type || 'EVERGREEN',
      isPrivate: isPrivate || false,
      members: {
        create: {
          userId: req.user!.id,
          role: 'ADMIN',
        },
      },
    },
    include: {
      _count: { select: { members: true, posts: true } },
    },
  });

  res.status(201).json(new ApiResponse(201, 'Community created', community));
});

/**
 * GET /api/v1/communities
 * Get all communities (paginated)
 */
export const getCommunities = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', search } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const where = search
    ? {
        OR: [
          { name: { contains: search as string, mode: 'insensitive' as const } },
          { description: { contains: search as string, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [communities, total] = await Promise.all([
    prisma.community.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
      include: {
        _count: { select: { members: true, posts: true } },
      },
    }),
    prisma.community.count({ where }),
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Communities fetched', {
      communities,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    })
  );
});

/**
 * GET /api/v1/communities/:slug
 * Get a single community by slug
 */
export const getCommunityBySlug = asyncHandler(async (req: AuthRequest, res: Response) => {
  const slug = req.params.slug as string;

  const community = await prisma.community.findUnique({
    where: { slug },
    include: {
      members: {
        take: 10,
        include: {
          user: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
      },
      _count: { select: { members: true, posts: true } },
    },
  });

  if (!community) {
    throw new ApiError(404, 'Community not found');
  }

  res.status(200).json(new ApiResponse(200, 'Community fetched', community));
});

/**
 * POST /api/v1/communities/:slug/join
 * Join a community
 */
export const joinCommunity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const slug = req.params.slug as string;

  const community = await prisma.community.findUnique({ where: { slug } });
  if (!community) throw new ApiError(404, 'Community not found');

  // Check if already a member
  const existing = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: req.user!.id, communityId: community.id } },
  });
  if (existing) {
    throw new ApiError(409, 'You are already a member of this community');
  }

  await prisma.communityMember.create({
    data: {
      userId: req.user!.id,
      communityId: community.id,
      role: 'MEMBER',
    },
  });

  res.status(200).json(new ApiResponse(200, 'Joined community successfully'));
});

/**
 * POST /api/v1/communities/:slug/leave
 * Leave a community
 */
export const leaveCommunity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const slug = req.params.slug as string;

  const community = await prisma.community.findUnique({ where: { slug } });
  if (!community) throw new ApiError(404, 'Community not found');

  const membership = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: req.user!.id, communityId: community.id } },
  });
  if (!membership) {
    throw new ApiError(400, 'You are not a member of this community');
  }

  // Prevent last admin from leaving
  if (membership.role === 'ADMIN') {
    const adminCount = await prisma.communityMember.count({
      where: { communityId: community.id, role: 'ADMIN' },
    });
    if (adminCount <= 1) {
      throw new ApiError(400, 'You are the last admin. Transfer ownership before leaving.');
    }
  }

  await prisma.communityMember.delete({
    where: { id: membership.id },
  });

  res.status(200).json(new ApiResponse(200, 'Left community successfully'));
});

/**
 * PUT /api/v1/communities/:slug
 * Update community details (admin only)
 */
export const updateCommunity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const slug = req.params.slug as string;
  const { description, iconUrl, bannerUrl } = req.body;

  const community = await prisma.community.findUnique({ where: { slug } });
  if (!community) throw new ApiError(404, 'Community not found');

  // Check if user is community admin
  const membership = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: req.user!.id, communityId: community.id } },
  });
  if (!membership || (membership.role !== 'ADMIN' && req.user!.role !== 'ADMIN')) {
    throw new ApiError(403, 'Only community admins can update settings');
  }

  const updated = await prisma.community.update({
    where: { slug },
    data: {
      ...(description !== undefined && { description }),
      ...(iconUrl !== undefined && { iconUrl }),
      ...(bannerUrl !== undefined && { bannerUrl }),
    },
    include: {
      _count: { select: { members: true, posts: true } },
    },
  });

  res.status(200).json(new ApiResponse(200, 'Community updated', updated));
});
