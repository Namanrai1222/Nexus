import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Info, ChevronRight } from 'lucide-react';
import { communityApi } from '../api/communityApi';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/posts/PostCard';
import CommunityHeader from '../components/community/CommunityHeader';
import { PageLoader } from '../components/shared/Loader';
import { formatDate, formatCount } from '../utils/formatDate';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/cn';
import type { Community } from '../types';
import toast from 'react-hot-toast';
import { usePageTitle } from '../hooks/usePageTitle';

type Tab = 'posts' | 'about';

export default function CommunityPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<Tab>('posts');

  const { data: community, isLoading, isError } = useQuery({
    queryKey: ['community', slug],
    queryFn: async () => {
      const { data } = await communityApi.getBySlug(slug!);
      return data.data as Community;
    },
    enabled: !!slug,
  });

  usePageTitle(community ? `r/${community.slug}` : undefined);

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
      <div className="text-center py-16 card-nx">
        <p className="text-lg font-display font-bold text-text">Community not found</p>
        <p className="text-sm text-subtext mt-1">This community doesn&apos;t exist or has been removed.</p>
        <Link to="/feed" className="btn-primary mt-4 inline-block text-sm">Back to Feed</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-subtext mb-4">
        <Link to="/feed" className="hover:text-text transition-colors">Feed</Link>
        <ChevronRight size={14} />
        <span className="text-text">r/{community.name}</span>
      </nav>

      <CommunityHeader
        community={community}
        isMember={!!isMember}
        isAuthenticated={!!user}
        onJoin={() => joinMutation.mutate()}
        onLeave={() => leaveMutation.mutate()}
        joinPending={joinMutation.isPending}
        leavePending={leaveMutation.isPending}
      />

      {/* Tabs */}
      <div className="flex border-b border-border mb-4">
        {(['posts', 'about'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize',
              tab === t
                ? 'border-purple text-purple'
                : 'border-transparent text-subtext hover:text-text'
            )}
          >
            {t === 'posts' ? <FileText size={14} /> : <Info size={14} />}
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'posts' ? (
        postsLoading ? (
          <PageLoader />
        ) : !postsData || postsData.posts.length === 0 ? (
          <div className="text-center py-16 card-nx">
            <p className="text-lg font-display font-bold text-text">No posts in this community</p>
            <p className="text-sm text-subtext mt-1">Start a discussion by creating the first post!</p>
            <Link to="/submit" className="btn-primary mt-4 inline-block text-sm">Create Post</Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {postsData.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {postsData.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg text-sm border border-border text-subtext hover:text-text hover:bg-bg3 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-subtext">Page {page} of {postsData.totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(postsData.totalPages, p + 1))}
                  disabled={page === postsData.totalPages}
                  className="px-4 py-2 rounded-lg text-sm border border-border text-subtext hover:text-text hover:bg-bg3 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )
      ) : (
        <div className="card-nx p-6">
          <h2 className="font-display font-bold text-text mb-3">About r/{community.name}</h2>
          <p className="text-sm text-subtext">{community.description || 'No description provided.'}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-bg3 rounded-lg p-3">
              <p className="text-subtext text-xs">Members</p>
              <p className="text-lg font-bold text-purple">{formatCount(community._count?.members ?? 0)}</p>
            </div>
            <div className="bg-bg3 rounded-lg p-3">
              <p className="text-subtext text-xs">Posts</p>
              <p className="text-lg font-bold text-text">{formatCount(community._count?.posts ?? 0)}</p>
            </div>
            <div className="bg-bg3 rounded-lg p-3">
              <p className="text-subtext text-xs">Created</p>
              <p className="text-sm font-medium text-text">{formatDate(community.createdAt)}</p>
            </div>
            <div className="bg-bg3 rounded-lg p-3">
              <p className="text-subtext text-xs">Health Score</p>
              <p className="text-lg font-bold text-green">{community.healthScore}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
