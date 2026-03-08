import { useState } from 'react';
import { Flame, Clock, TrendingUp } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/posts/PostCard';
import { PageLoader } from '../components/shared/Loader';
import { cn } from '../utils/cn';

const sortOptions = [
  { key: 'hot' as const, label: 'Hot', icon: Flame },
  { key: 'new' as const, label: 'New', icon: Clock },
  { key: 'top' as const, label: 'Top', icon: TrendingUp },
];

export default function Home() {
  const [sort, setSort] = useState<'hot' | 'new' | 'top'>('hot');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = usePosts({ sort, page, limit: 20 });

  return (
    <div>
      {/* Sort tabs */}
      <div className="flex items-center gap-1 bg-card rounded-lg border border-border p-1.5 mb-4">
        {sortOptions.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              setSort(key);
              setPage(1);
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              sort === key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Posts feed */}
      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          Failed to load posts. Please try again later.
        </div>
      ) : !data || data.posts.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-lg font-medium">No posts yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Be the first to start a discussion!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-md text-sm border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
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
