import { Router } from 'express';
import {
  getUserProfile,
  getUserPosts,
  updateProfile,
  uploadAvatar,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/:username', getUserProfile);
router.get('/:username/posts', getUserPosts);
router.put('/profile', authenticate, updateProfile);
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);

export default router;
