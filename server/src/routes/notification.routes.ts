import { Router } from 'express';
import { notificationService } from '../services/notification.service';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { Response } from 'express';

const router = Router();

/**
 * GET /api/v1/notifications
 * Get notifications for the authenticated user
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit } = req.query;
    const result = await notificationService.getByUser(
      req.user!.id,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );
    res.status(200).json(new ApiResponse(200, 'Notifications fetched', result));
  })
);

/**
 * PUT /api/v1/notifications/:id/read
 * Mark a single notification as read
 */
router.put(
  '/:id/read',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await notificationService.markAsRead(req.params.id as string, req.user!.id);
    res.status(200).json(new ApiResponse(200, 'Notification marked as read'));
  })
);

/**
 * PUT /api/v1/notifications/read-all
 * Mark all notifications as read
 */
router.put(
  '/read-all',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await notificationService.markAllAsRead(req.user!.id);
    res.status(200).json(new ApiResponse(200, 'All notifications marked as read'));
  })
);

export default router;
