import { prisma } from '../config/db';
import { ApiError } from '../utils/ApiError';
import slugify from 'slugify';

interface CreatePostInput {
  title: string;
  body: string;
  type?: 'TEXT' | 'IMAGE' | 'LINK';
  communityId: string;
  tags?: string[];
  linkUrl?: string;
  imageUrl?: string;
  authorId: string;
}

interface GetPostsQuery {
  page?: number;
  limit?: number;
  sort?: 'hot' | 'new' | 'top';
  community?: string;
  tag?: string;
}

export const postService = {
  async create(input: CreatePostInput) {
    const { title, body, type, communityId, tags, linkUrl, imageUrl, authorId } = input;

    // Verify community exists
    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) {
      throw new ApiError(404, 'Community not found');
    }

    // Generate unique slug
    const baseSlug = slugify(title, { lower: true, strict: true });
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const post = await prisma.post.create({
      data: {
        title,
        body,
        type: type || 'TEXT',
        slug,
        linkUrl,
        imageUrl,
        authorId,
        communityId,
        tags: {
          create:
            tags?.map((name: string) => ({
              tag: {
                connectOrCreate: {
                  where: { name: name.toLowerCase().trim() },
                  create: { name: name.toLowerCase().trim() },
                },
              },
            })) ?? [],
        },
      },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true, impactScore: true },
        },
        community: {
          select: { id: true, name: true, slug: true, iconUrl: true },
        },
        tags: { include: { tag: true } },
        _count: { select: { comments: true, votes: true } },
      },
    });

    return post;
  },

  async getAll(query: GetPostsQuery) {
    const { page = 1, limit = 20, sort = 'hot', community, tag } = query;
    const skip = (page - 1) * limit;

    const orderBy =
      sort === 'new'
        ? { createdAt: 'desc' as const }
        : sort === 'top'
          ? { score: 'desc' as const }
          : [{ score: 'desc' as const }, { createdAt: 'desc' as const }];

    const where: Record<string, unknown> = { isDeleted: false };
    if (community) {
      where.community = { slug: community };
    }
    if (tag) {
      where.tags = { some: { tag: { name: tag } } };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          author: {
            select: { id: true, username: true, avatarUrl: true, impactScore: true },
          },
          community: {
            select: { id: true, name: true, slug: true, iconUrl: true },
          },
          tags: { include: { tag: true } },
          _count: { select: { comments: true, votes: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return {
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + posts.length < total,
    };
  },

  async getBySlug(slug: string) {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true, impactScore: true, bio: true },
        },
        community: true,
        tags: { include: { tag: true } },
        comments: {
          where: { parentId: null, isDeleted: false },
          include: {
            author: {
              select: { id: true, username: true, avatarUrl: true },
            },
            replies: {
              where: { isDeleted: false },
              include: {
                author: {
                  select: { id: true, username: true, avatarUrl: true },
                },
                replies: {
                  where: { isDeleted: false },
                  include: {
                    author: {
                      select: { id: true, username: true, avatarUrl: true },
                    },
                  },
                  orderBy: { score: 'desc' },
                },
              },
              orderBy: { score: 'desc' },
            },
          },
          orderBy: { score: 'desc' },
        },
        summary: true,
        _count: { select: { comments: true, votes: true } },
      },
    });

    if (!post || post.isDeleted) {
      throw new ApiError(404, 'Post not found');
    }

    // Increment view count (fire and forget)
    prisma.post.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    return post;
  },

  async update(postId: string, userId: string, data: { title?: string; body?: string }) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new ApiError(404, 'Post not found');
    if (post.authorId !== userId) throw new ApiError(403, 'Not authorized to edit this post');

    // Save version before editing
    await prisma.postVersion.create({
      data: {
        postId: post.id,
        title: post.title,
        body: post.body,
        editedBy: userId,
      },
    });

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.body && { body: data.body }),
      },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        community: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: true } },
      },
    });

    return updated;
  },

  async softDelete(postId: string, userId: string, userRole: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new ApiError(404, 'Post not found');
    if (post.authorId !== userId && userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      throw new ApiError(403, 'Not authorized to delete this post');
    }

    await prisma.post.update({
      where: { id: postId },
      data: { isDeleted: true },
    });
  },

  async vote(postId: string, userId: string, value: 1 | -1) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new ApiError(404, 'Post not found');

    const existing = await prisma.vote.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    let newScore = post.score;

    if (existing) {
      if (existing.value === value) {
        // Same vote → remove it (un-vote)
        await prisma.vote.delete({ where: { id: existing.id } });
        newScore -= value;
      } else {
        // Opposite vote → flip it
        await prisma.vote.update({ where: { id: existing.id }, data: { value } });
        newScore += value * 2;
      }
    } else {
      // New vote
      await prisma.vote.create({ data: { userId, postId, value } });
      newScore += value;
    }

    await prisma.post.update({
      where: { id: postId },
      data: { score: newScore },
    });

    // Update author's impact score
    if (post.authorId !== userId) {
      await prisma.user.update({
        where: { id: post.authorId },
        data: { impactScore: { increment: value } },
      });
    }

    return { score: newScore };
  },
};
