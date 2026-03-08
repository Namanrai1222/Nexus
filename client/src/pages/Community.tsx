import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Shield, Globe, Lock, Clock, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { communityApi } from '../api/communityApi';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/posts/PostCard';
import Avatar from '../components/shared/Avatar';
import Badge from '../components/shared/Badge';
import { PageLoader } from '../components/shared/Loader';
import { formatDate, formatCount } from '../utils/formatDate';
import { useAuthStore } from '../store/authStore';
import type { Community } from '../types';
import toast from 'react-hot-toast';

const typeIcons: Record<string, React.ReactNode> = {
  EVERGREEN: <Globe className="w-4 h-4" />,
  TIMEBOUNDED: <Clock className="w-4 h-4" />,
  PRIVATE: <Lock className="w-4 h-4" />,
  FEDERATED: <Shield className="w-4 h-4" />,
  ANONYMOUS: <Users className="w-4 h-4" />,
};

export default function CommunityPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data: community, isLoading, isError } = useQuery({
    queryKey: ['community', slug],
    queryFn: async () => {
      const { data } = await communityApi.getBySlug(slug!);
      return data.data as Community;
    },
    enabled: !!slug,
  });

  const { data: postsData, isLoading: postsLoading } = usePosts({
    community: slug,
    page,
    limit: 20,
    sort: 'new',
  });

  const isMember = community?.members?.some((m) => m.userId === user?.id);

  const joinMutation = useMutation({
    mutationFn: () => communityApi.join(slug!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', slug] });
      toast.success('Joined community!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to join'),
  });

  const leaveMutation = useMutation({
    mutationFn: () => communityApi.leave(slug!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', slug] });
      toast.success('Left community');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to leave'),
  });

  if (isLoading) return <PageLoader />;

  if (isError || !community) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <p className="text-lg font-medium">Community not found</p>
        <p className="text-sm text-muted-foreground mt-1">
          This community doesn&apos;t exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Community header */}
      <div className="bg-card rounded-lg border border-border overflow-hidden mb-4">
        {/* Banner */}
        {community.bannerUrl ? (
          <img
            src={community.bannerUrl}
            alt="Banner"
            className="w-full h-32 sm:h-44 object-cover"
          />
        ) : (
          <div className="w-full h-32 sm:h-44 bg-gradient-to-r from-primary/20 to-primary/5" />
        )}

        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="-mt-12 sm:-mt-14">
              {community.iconUrl ? (
                <img
                  src={community.iconUrl}
                  alt={community.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-card object-cover"
                />
              ) : (
                <Avatar
                  username={community.name}
                  size="xl"
                  className="border-4 border-card"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold">c/{community.name}</h1>
                <Badge variant="outline" className="gap-1">
                  {typeIcons[community.type]}
                  {community.type}
                </Badge>
              </div>

              {community.description && (
                <p className="text-sm text-muted-foreground mt-1">{community.description}</p>
              )}

              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {formatCount(community._count?.members ?? 0)} members
                </span>
                <span>{formatCount(community._count?.posts ?? 0)} posts</span>
                <span>Created {formatDate(community.createdAt)}</span>
              </div>
            </div>

            {/* Join/Leave button */}
            {user && (
              <div>
                {isMember ? (
                  <button
                    onClick={() => leaveMutation.mutate()}
                    disabled={leaveMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors disabled:opacity-50"
                  >
                    {leaveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserMinus className="w-4 h-4" />
                    )}
                    Leave
                  </button>
                ) : (
                  <button
                    onClick={() => joinMutation.mutate()}
                    disabled={joinMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {joinMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    Join
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Community posts */}
      {postsLoading ? (
        <PageLoader />
      ) : !postsData || postsData.posts.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-lg font-medium">No posts in this community</p>
          <p className="text-sm text-muted-foreground mt-1">
            Start a discussion by creating the first post!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {postsData.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {postsData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-md text-sm border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {postsData.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(postsData.totalPages, p + 1))}
                disabled={page === postsData.totalPages}
                className="px-3 py-1.5 rounded-md text-sm border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
