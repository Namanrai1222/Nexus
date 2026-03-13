import { useQuery } from '@tanstack/react-query';
import { landingApi } from '../api/landingApi';

export function useLandingStats() {
  return useQuery({
    queryKey: ['landing-stats'],
    queryFn: async () => {
      const { data } = await landingApi.getPlatformStats();
      return data.data;
    },
  });
}

export function useHotPosts() {
  return useQuery({
    queryKey: ['landing-hot-posts'],
    queryFn: async () => {
      const { data } = await landingApi.getHotPosts();
      return data.data;
    },
  });
}

export function useTopCommunities() {
  return useQuery({
    queryKey: ['landing-top-communities'],
    queryFn: async () => {
      const { data } = await landingApi.getTopCommunities();
      return data.data;
    },
  });
}

export function useRecentPosts() {
  return useQuery({
    queryKey: ['landing-recent-posts'],
    queryFn: async () => {
      const { data } = await landingApi.getRecentPosts();
      return data.data;
    },
    refetchInterval: 30000,
  });
}
