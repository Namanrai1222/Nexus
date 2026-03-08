import { prisma } from '../config/db';
import { ApiError } from '../utils/ApiError';

interface CreateCommentInput {
  body: string;
  postId: string;
  authorId: string;
  parentId?: string;
}

export const commentService = {
  async create(input: CreateCommentInput) {
    const { body, postId, authorId, parentId } = input;

    // Verify post exists and is not locked
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.isDeleted) throw new ApiError(404, 'Post not found');
    if (post.isLocked) throw new ApiError(403, 'This post is locked');

    // Verify parent comment if replying
    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent) throw new ApiError(404, 'Parent comment not found');
      if (parent.postId !== postId) throw new ApiError(400, 'Parent comment is not on this post');
    }

    const comment = await prisma.comment.create({
      data: { body, postId, authorId, parentId },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true },
        },
        replies: {
          include: {
            author: { select: { id: true, username: true, avatarUrl: true } },
          },
        },
      },
    });

    // Notify post author of new comment
    if (post.authorId !== authorId) {
      await prisma.notification.create({
        data: {
          type: 'COMMENT_REPLY',
          message: `New comment on your post "${post.title}"`,
          userId: post.authorId,
          link: `/r/${post.communityId}/post/${post.slug}`,
        },
      });
    }

    // Notify parent comment author of reply
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
      if (parentComment && parentComment.authorId !== authorId) {
        await prisma.notification.create({
          data: {
            type: 'COMMENT_REPLY',
            message: 'Someone replied to your comment',
            userId: parentComment.authorId,
            link: `/r/${post.communityId}/post/${post.slug}`,
          },
        });
      }
    }

    return comment;
  },

  async getByPost(postId: string) {
    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null, isDeleted: false },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        replies: {
          where: { isDeleted: false },
          include: {
            author: { select: { id: true, username: true, avatarUrl: true } },
            replies: {
              where: { isDeleted: false },
              include: {
                author: { select: { id: true, username: true, avatarUrl: true } },
              },
              orderBy: { score: 'desc' },
            },
          },
          orderBy: { score: 'desc' },
        },
      },
      orderBy: { score: 'desc' },
    });

    return comments;
  },

  async vote(commentId: string, userId: string, value: 1 | -1) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.isDeleted) throw new ApiError(404, 'Comment not found');

    const existing = await prisma.vote.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    let newScore = comment.score;

    if (existing) {
      if (existing.value === value) {
        await prisma.vote.delete({ where: { id: existing.id } });
        newScore -= value;
      } else {
        await prisma.vote.update({ where: { id: existing.id }, data: { value } });
        newScore += value * 2;
      }
    } else {
      await prisma.vote.create({ data: { userId, commentId, value } });
      newScore += value;
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { score: newScore },
    });

    // Update author impact score
    if (comment.authorId !== userId) {
      await prisma.user.update({
        where: { id: comment.authorId },
        data: { impactScore: { increment: value } },
      });
    }

    return { score: newScore };
  },

  async softDelete(commentId: string, userId: string, userRole: string) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new ApiError(404, 'Comment not found');
    if (comment.authorId !== userId && userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      throw new ApiError(403, 'Not authorized to delete this comment');
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true, body: '[deleted]' },
    });
  },
};
