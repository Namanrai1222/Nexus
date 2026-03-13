import { Response } from 'express';
import { postService } from '../services/post.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * POST /api/v1/posts
 * Create a new post
 */
export const createPost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, body, type, communityId, tags, linkUrl } = req.body;

  if (!title || !body || !communityId) {
    throw new ApiError(400, 'Title, body, and communityId are required');
  }

  const post = await postService.create({
    title,
    body,
    type,
    communityId,
    tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : undefined,
    linkUrl,
    imageUrl: (req.file as Express.Multer.File | undefined)?.path,
    authorId: req.user!.id,
  });

  res.status(201).json(new ApiResponse(201, 'Post created', post));
});

/**
 * GET /api/v1/posts
 * Get paginated posts with sorting & filtering
 */
export const getPosts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, sort, community, tag, search } = req.query;

  const result = await postService.getAll({
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    sort: sort as 'hot' | 'new' | 'top' | undefined,
    community: community as string | undefined,
    tag: tag as string | undefined,
    search: search as string | undefined,
  });

  res.status(200).json(new ApiResponse(200, 'Posts fetched', result));
});

/**
 * GET /api/v1/posts/:slug
 * Get a single post by slug
 */
export const getPostBySlug = asyncHandler(async (req: AuthRequest, res: Response) => {
  const slug = req.params.slug as string;
  const post = await postService.getBySlug(slug);
  res.status(200).json(new ApiResponse(200, 'Post fetched', post));
});

/**
 * PUT /api/v1/posts/:postId
 * Update a post (author only)
 */
export const updatePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const postId = req.params.postId as string;
  const { title, body } = req.body;

  const post = await postService.update(postId, req.user!.id, { title, body });
  res.status(200).json(new ApiResponse(200, 'Post updated', post));
});

/**
 * DELETE /api/v1/posts/:postId
 * Soft-delete a post (author or moderator)
 */
export const deletePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const postId = req.params.postId as string;
  await postService.softDelete(postId, req.user!.id, req.user!.role);
  res.status(200).json(new ApiResponse(200, 'Post deleted'));
});

/**
 * POST /api/v1/posts/:postId/vote
 * Vote on a post (+1 or -1)
 */
export const votePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const postId = req.params.postId as string;
  const { value } = req.body;

  if (value !== 1 && value !== -1) {
    throw new ApiError(400, 'Vote value must be 1 or -1');
  }

  const result = await postService.vote(postId, req.user!.id, value);
  res.status(200).json(new ApiResponse(200, 'Vote recorded', result));
});
