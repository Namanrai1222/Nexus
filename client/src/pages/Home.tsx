import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Flame, Clock, TrendingUp, Plus, Users, Hash, Loader2, Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usePosts } from '../hooks/usePosts';
import { communityApi } from '../api/communityApi';
import { landingApi } from '../api/landingApi';
import PostCard from '../components/posts/PostCard';
import { PageLoader } from '../components/shared/Loader';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/cn';
import { usePageTitle } from '../hooks/usePageTitle';

const sortOptions = [
  { key: 'hot' as const, label: 'Hot', icon: Flame },
  { key: 'new' as const, label: 'New', icon: Clock },
  { key: 'top' as const, label: 'Top', icon: TrendingUp },
];

export default function Home() {
  usePageTitle('Feed');
  const [sort, setSort] = useState<'hot' | 'new' | 'top'>('hot');
  const [page, setPage] = useState(1);
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const { data, isLoading, isError } = usePosts({ sort, page, limit: 20, search: searchQuery || undefined });

  const { data: communitiesData } = useQuery({
    queryKey: ['communities', 'sidebar'],
    queryFn: async () => {
      const { data } = await communityApi.getAll({ page: 1 });
      return data.data;
    },
  });
  const communities = communitiesData?.communities ?? [];

  const { data: trendingTagsData } = useQuery({
    queryKey: ['trending-tags'],
    queryFn: async () => {
      const { data } = await landingApi.getTrendingTags();
      return data.data as Array<{ id: string; name: string; count: number }>;
    },
  });
  const trendingTags = trendingTagsData ?? [];

  return (
    <div className="flex gap-6">
      {/* Left sidebar */}
      <aside className="hidden xl:block w-60 shrink-0 space-y-4">
        {user && (
          <div className="card-nx p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple/20 flex items-center justify-center text-purple font-bold">
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <p className="text-text font-medium text-sm">{user.displayName || user.username}</p>
                <p className="text-subtext text-xs">u/{user.username}</p>
              </div>
            </div>
            <Link to="/submit" className="btn-primary w-full text-center text-sm py-2 block">
              <Plus size={14} className="inline mr-1" /> New Post
            </Link>
          </div>
        )}

        <div className="card-nx p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-subtext mb-3">Top Communities</h3>
          <div className="space-y-2">
            {communities.slice(0, 8).map((c) => (
              <Link
                key={c.id}
                to={`/r/${c.slug}`}
                className="flex items-center gap-2.5 text-sm text-subtext hover:text-text transition-colors py-1"
              >
                <div className="w-6 h-6 rounded-md bg-purple/20 flex items-center justify-center text-xs font-bold text-purple shrink-0">
                  {c.name[0].toUpperCase()}
                </div>
                <span className="truncate">r/{c.name}</span>
                <span className="ml-auto text-xs text-subtext/60">
                  <Users size={10} className="inline mr-0.5" />
                  {c._count?.members ?? 0}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card-nx p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-subtext mb-3">Trending Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {trendingTags.length > 0
              ? trendingTags.slice(0, 10).map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/feed?search=${encodeURIComponent(tag.name)}`}
                    className="tag-nx text-xs"
                  >
                    <Hash size={10} className="inline mr-0.5" />{tag.name}
                  </Link>
                ))
              : ['javascript', 'react', 'ai', 'webdev', 'design'].map((tag) => (
                  <span key={tag} className="tag-nx text-xs">
                    <Hash size={10} className="inline mr-0.5" />{tag}
                  </span>
                ))}
          </div>
        </div>
      </aside>

      {/* Main feed */}
      <div className="flex-1 min-w-0">
        {/* Sort tabs */}
        <div className="flex items-center gap-1 bg-card rounded-xl border border-border p-1.5 mb-4">
          {sortOptions.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setSort(key); setPage(1); }}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                sort === key
                  ? 'bg-purple text-white'
                  : 'text-subtext hover:text-text hover:bg-bg3'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Search indicator */}
        {searchQuery && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-purple/5 border border-purple/20">
            <Search className="w-4 h-4 text-purple" />
            <span className="text-sm text-text">
              Results for <strong>"{searchQuery}"</strong>
            </span>
            <button
              onClick={() => setSearchParams({})}
              className="ml-auto p-1 rounded hover:bg-bg3 text-subtext hover:text-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Posts */}
        {isLoading ? (
          <PageLoader />
        ) : isError ? (
          <div className="text-center py-16 text-subtext">
            Failed to load posts. Please try again later.
          </div>
        ) : !data || data.posts.length === 0 ? (
          <div className="text-center py-16 card-nx">
            <p className="text-lg font-display font-bold text-text">No posts yet</p>
            <p className="text-sm text-subtext mt-1">Be the first to start a discussion!</p>
            <Link to="/submit" className="btn-primary mt-4 inline-block">Create Post</Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {data.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg text-sm border border-border text-subtext hover:text-text hover:bg-bg3 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-subtext">
                  Page {page} of {data.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="px-4 py-2 rounded-lg text-sm border border-border text-subtext hover:text-text hover:bg-bg3 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 space-y-4">
        <div className="card-nx p-4">
          <h3 className="font-display font-bold text-text mb-2">Create a Community</h3>
          <p className="text-sm text-subtext mb-3">Start your own community and grow it.</p>
          <Link to="/create-community" className="btn-ghost w-full text-center text-sm py-2 block">Create Community</Link>
        </div>

        <div className="card-nx p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-subtext mb-3">Top Communities</h3>
          <div className="space-y-2.5">
            {communities.slice(0, 5).map((c, i) => (
              <Link
                key={c.id}
                to={`/r/${c.slug}`}
                className="flex items-center gap-2.5 hover:bg-bg3 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
              >
                <span className="text-xs font-bold text-subtext w-4">{i + 1}</span>
                <div className="w-7 h-7 rounded-full bg-purple/20 flex items-center justify-center text-xs font-bold text-purple">
                  {c.name[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text truncate">r/{c.name}</p>
                  <p className="text-xs text-subtext">{c._count?.members ?? 0} members</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
