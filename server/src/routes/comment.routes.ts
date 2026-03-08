import { Router } from 'express';
import {
  createComment,
  getCommentsByPost,
  voteComment,
  deleteComment,
} from '../controllers/comment.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createComment);
router.get('/post/:postId', optionalAuth, getCommentsByPost);
router.post('/:commentId/vote', authenticate, voteComment);
router.delete('/:commentId', authenticate, deleteComment);

export default router;
