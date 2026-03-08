import { prisma } from '../config/db';
import { ApiError } from '../utils/ApiError';

export const notificationService = {
  async getByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) throw new ApiError(404, 'Notification not found');
    if (notification.userId !== userId) throw new ApiError(403, 'Not authorized');

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async create(data: {
    type: 'COMMENT_REPLY' | 'POST_VOTE' | 'COMMENT_VOTE' | 'MENTION' | 'COMMUNITY_INVITE' | 'MODERATION_ACTION' | 'NEW_FOLLOWER';
    message: string;
    userId: string;
    link?: string;
  }) {
    return prisma.notification.create({ data });
  },
};
