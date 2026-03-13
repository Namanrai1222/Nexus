import { Router } from 'express';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Platform-wide stats
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [totalUsers, totalPosts, totalCommunities, totalComments] =
      await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.community.count(),
        prisma.comment.count(),
      ]);

    res.json({
      success: true,
      data: { totalUsers, totalPosts, totalCommunities, totalComments },
    });
  })
);

// Trending tags (most used in the last 7 days)
router.get(
  '/trending-tags',
  asyncHandler(async (_req, res) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const tags = await prisma.postTag.groupBy({
      by: ['tagId'],
      _count: { tagId: true },
      where: {
        post: {
          createdAt: { gte: sevenDaysAgo },
          isDeleted: false,
        },
      },
      orderBy: { _count: { tagId: 'desc' } },
      take: 20,
    });

    const tagIds = tags.map((t) => t.tagId);
    const tagDetails = await prisma.tag.findMany({
      where: { id: { in: tagIds } },
    });

    const tagMap = new Map(tagDetails.map((t) => [t.id, t]));
    const trending = tags.map((t) => ({
      ...tagMap.get(t.tagId),
      count: t._count.tagId,
    }));

    res.json({ success: true, data: trending });
  })
);

// Top communities by member count
router.get(
  '/top-communities',
  asyncHandler(async (_req, res) => {
    const communities = await prisma.community.findMany({
      orderBy: { members: { _count: 'desc' } },
      take: 10,
      include: {
        _count: { select: { members: true, posts: true } },
      },
    });

    res.json({ success: true, data: communities });
  })
);

// Active users (most posts/comments in last 7 days)
router.get(
  '/active-users',
  asyncHandler(async (_req, res) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activePosters = await prisma.post.groupBy({
      by: ['authorId'],
      _count: { id: true },
      where: { createdAt: { gte: sevenDaysAgo }, isDeleted: false },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const userIds = activePosters.map((p) => p.authorId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, avatarUrl: true, impactScore: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));
    const result = activePosters.map((p) => ({
      ...userMap.get(p.authorId),
      postCount: p._count.id,
    }));

    res.json({ success: true, data: result });
  })
);

export default router;
