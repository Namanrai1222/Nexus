import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPostBySlug,
  updatePost,
  deletePost,
  votePost,
} from '../controllers/post.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { postCreateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.get('/', optionalAuth, getPosts);
router.get('/:slug', optionalAuth, getPostBySlug);
router.post('/', authenticate, postCreateLimiter, upload.single('image'), createPost);
router.put('/:postId', authenticate, updatePost);
router.delete('/:postId', authenticate, deletePost);
router.post('/:postId/vote', authenticate, votePost);

export default router;
