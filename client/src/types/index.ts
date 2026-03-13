// TypeScript types shared across the frontend

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  impactScore: number;
  createdAt: string;
  _count?: {
    posts: number;
    comments: number;
    communities: number;
  };
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  bannerUrl?: string;
  type: 'EVERGREEN' | 'TIMEBOUNDED' | 'PRIVATE' | 'FEDERATED' | 'ANONYMOUS';
  isPrivate: boolean;
  healthScore: number;
  createdAt: string;
  _count?: {
    members: number;
    posts: number;
  };
  members?: CommunityMember[];
}

export interface CommunityMember {
  id: string;
  userId: string;
  communityId: string;
  role: 'MEMBER' | 'MODERATOR' | 'ADMIN';
  joinedAt: string;
  user?: Pick<User, 'id' | 'username' | 'avatarUrl'>;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  type: 'TEXT' | 'IMAGE' | 'LINK';
  imageUrl?: string;
  linkUrl?: string;
  slug: string;
  isPinned: boolean;
  isLocked: boolean;
  isDeleted: boolean;
  viewCount: number;
  score: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  communityId: string;
  author: Pick<User, 'id' | 'username' | 'avatarUrl' | 'impactScore'>;
  community: Pick<Community, 'id' | 'name' | 'slug' | 'iconUrl'>;
  tags: PostTag[];
  comments?: Comment[];
  _count?: {
    comments: number;
    votes: number;
  };
}

export interface Comment {
  id: string;
  body: string;
  score: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  postId: string;
  parentId?: string;
  author: Pick<User, 'id' | 'username' | 'avatarUrl'>;
  replies?: Comment[];
}

export interface PostTag {
  postId: string;
  tagId: string;
  tag: Tag;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Vote {
  id: string;
  value: 1 | -1;
  userId: string;
  postId?: string;
  commentId?: string;
}

export interface Notification {
  id: string;
  type: 'COMMENT_REPLY' | 'POST_VOTE' | 'COMMENT_VOTE' | 'MENTION' | 'COMMUNITY_INVITE' | 'MODERATION_ACTION' | 'NEW_FOLLOWER';
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore?: boolean;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  totalPages: number;
}

export interface LandingStats {
  totalUsers: number;
  totalPosts: number;
  totalCommunities: number;
  totalComments: number;
}

export interface FeedSliderSettings {
  recencyWeight: number;
  popularityWeight: number;
  diversityWeight: number;
  communityWeight: number;
  personalWeight: number;
}

export type FeedSort = 'hot' | 'new' | 'top';
export type PostType = 'TEXT' | 'IMAGE' | 'LINK';
export type Role = 'USER' | 'MODERATOR' | 'ADMIN';

export interface AIQualityResult {
  score: number;
  suggestions: string[];
  similarPosts: Array<{ id: string; title: string; slug: string; score: number }>;
}
