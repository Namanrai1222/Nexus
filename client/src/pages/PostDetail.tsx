import { useParams } from 'react-router-dom';
import { usePost } from '../hooks/usePosts';
import PostDetailComponent from '../components/posts/PostDetail';
import CommentThread from '../components/comments/CommentThread';
import { PageLoader } from '../components/shared/Loader';

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError } = usePost(slug ?? '');

  if (isLoading) return <PageLoader />;

  if (isError || !post) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <p className="text-lg font-medium">Post not found</p>
        <p className="text-sm text-muted-foreground mt-1">
          It may have been deleted or the link is incorrect.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PostDetailComponent post={post} />
      <CommentThread postId={post.id} isLocked={post.isLocked} />
    </div>
  );
}
