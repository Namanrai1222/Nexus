import { Router } from 'express';
import {
  createCommunity,
  getCommunities,
  getCommunityBySlug,
  joinCommunity,
  leaveCommunity,
  updateCommunity,
} from '../controllers/community.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', optionalAuth, getCommunities);
router.get('/:slug', optionalAuth, getCommunityBySlug);
router.post('/', authenticate, createCommunity);
router.put('/:slug', authenticate, updateCommunity);
router.post('/:slug/join', authenticate, joinCommunity);
router.post('/:slug/leave', authenticate, leaveCommunity);

export default router;
