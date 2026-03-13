import { Link } from 'react-router-dom';
import { ArrowUp, MessageSquare, ArrowRight } from 'lucide-react';
import { useRecentPosts } from '../../hooks/useLandingData';
import { formatDate } from '../../utils/formatDate';
import type { Post } from '../../types';

function PreviewCard({ post }: { post: Post }) {
  const isRecent = Date.now() - new Date(post.createdAt).getTime() < 3600000;

  return (
    <div className="card-nx flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="badge-nx text-[10px]">r/{post.community.slug}</span>
        {isRecent && (
          <span className="flex items-center gap-1 text-[10px] text-green font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            Live
          </span>
        )}
      </div>

      <Link
        to={`/r/${post.community.slug}/post/${post.slug}`}
        className="font-display font-semibold text-text text-sm hover:text-purple transition-colors mb-2 line-clamp-2"
      >
        {post.title}
      </Link>

      <p className="text-xs text-subtext mb-3 line-clamp-2 flex-1">
        {post.body.slice(0, 120)}
        {post.body.length > 120 && '...'}
      </p>

      <div className="flex items-center justify-between text-xs text-subtext mt-auto pt-3 border-t border-border">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <ArrowUp size={12} className="text-purple" />
            {post.score}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={12} />
            {post._count?.comments ?? 0}
          </span>
        </div>
        <span>{formatDate(post.createdAt)}</span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card-nx">
      <div className="skeleton h-4 w-20 mb-4" />
      <div className="skeleton h-5 w-full mb-2" />
      <div className="skeleton h-4 w-3/4 mb-4" />
      <div className="skeleton h-3 w-full mb-2" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  );
}

export default function LiveFeedPreview() {
  const { data, isLoading, isError } = useRecentPosts();
  const posts = data?.posts ?? data ?? [];

  return (
    <section id="live-feed" className="section-nx">
      <div className="container-nx">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-text mb-3">
            What&apos;s happening right now
          </h2>
          <p className="text-subtext text-lg">
            Live posts from the community — updated every 30 seconds
          </p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : isError || (Array.isArray(posts) && posts.length === 0) ? (
          <div className="text-center py-12 card-nx">
            <p className="text-subtext mb-3">Community is quiet right now.</p>
            <Link to="/submit" className="btn-primary text-sm">
              Be the first to post!
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray(posts) ? posts : []).slice(0, 3).map((post: Post) => (
              <PreviewCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/feed" className="btn-ghost text-sm inline-flex items-center gap-2">
            See all posts <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
