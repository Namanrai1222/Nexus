import { Response } from 'express';
import { commentService } from '../services/comment.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * POST /api/v1/comments
 * Create a new comment on a post
 */
export const createComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { body, postId, parentId } = req.body;

  if (!body || !postId) {
    throw new ApiError(400, 'Body and postId are required');
  }

  const comment = await commentService.create({
    body,
    postId,
    authorId: req.user!.id,
    parentId,
  });

  res.status(201).json(new ApiResponse(201, 'Comment created', comment));
});

/**
 * GET /api/v1/comments/post/:postId
 * Get all comments for a post (threaded)
 */
export const getCommentsByPost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const postId = req.params.postId as string;
  const comments = await commentService.getByPost(postId);
  res.status(200).json(new ApiResponse(200, 'Comments fetched', comments));
});

/**
 * POST /api/v1/comments/:commentId/vote
 * Vote on a comment (+1 or -1)
 */
export const voteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const commentId = req.params.commentId as string;
  const { value } = req.body;

  if (value !== 1 && value !== -1) {
    throw new ApiError(400, 'Vote value must be 1 or -1');
  }

  const result = await commentService.vote(commentId, req.user!.id, value);
  res.status(200).json(new ApiResponse(200, 'Vote recorded', result));
});

/**
 * DELETE /api/v1/comments/:commentId
 * Soft-delete a comment (author or moderator)
 */
export const deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const commentId = req.params.commentId as string;
  await commentService.softDelete(commentId, req.user!.id, req.user!.role);
  res.status(200).json(new ApiResponse(200, 'Comment deleted'));
});
