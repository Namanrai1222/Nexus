import axiosClient from './axiosClient';

export const landingApi = {
  getPlatformStats: () => axiosClient.get('/stats'),
  getHotPosts: () => axiosClient.get('/posts', { params: { sort: 'hot', limit: 6 } }),
  getTopCommunities: () => axiosClient.get('/communities', { params: { limit: 6, sort: 'members' } }),
  getRecentPosts: () => axiosClient.get('/posts', { params: { sort: 'new', limit: 3 } }),
  getTrendingTags: () => axiosClient.get('/stats/trending-tags'),
};
