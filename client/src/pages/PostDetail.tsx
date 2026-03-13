import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { usePost } from '../hooks/usePosts';
import PostDetailComponent from '../components/posts/PostDetail';
import CommentThread from '../components/comments/CommentThread';
import { PageLoader } from '../components/shared/Loader';
import { usePageTitle } from '../hooks/usePageTitle';

export default function PostDetailPage() {
  const { slug, postSlug } = useParams<{ slug: string; postSlug: string }>();
  const resolvedSlug = postSlug ?? slug ?? '';
  const { data: post, isLoading, isError } = usePost(resolvedSlug);
  usePageTitle(post?.title);

  if (isLoading) return <PageLoader />;

  if (isError || !post) {
    return (
      <div className="text-center py-16 card-nx">
        <p className="text-lg font-display font-bold text-text">Post not found</p>
        <p className="text-sm text-subtext mt-1">It may have been deleted or the link is incorrect.</p>
        <Link to="/feed" className="btn-primary mt-4 inline-block text-sm">Back to Feed</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-subtext mb-4">
        <Link to="/feed" className="hover:text-text transition-colors">Feed</Link>
        <ChevronRight size={14} />
        <Link to={`/r/${post.community.slug}`} className="hover:text-text transition-colors">
          r/{post.community.name}
        </Link>
        <ChevronRight size={14} />
        <span className="text-text truncate max-w-[200px]">{post.title}</span>
      </nav>

      <PostDetailComponent post={post} />
      <div className="mt-4">
        <CommentThread postId={post.id} isLocked={post.isLocked} />
      </div>
    </div>
  );
}
