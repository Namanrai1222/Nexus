import type { Comment } from '../../types';
import CommentItem from './CommentItem';
import CommentEditor from './CommentEditor';
import { useComments, useCreateComment } from '../../hooks/useComments';
import Loader from '../shared/Loader';
import { MessageSquare } from 'lucide-react';

interface CommentThreadProps {
  postId: string;
  isLocked?: boolean;
}

export default function CommentThread({ postId, isLocked = false }: CommentThreadProps) {
  const { data, isLoading } = useComments(postId);
  const createMutation = useCreateComment();

  const comments: Comment[] = data ?? [];

  const handleSubmit = (data: { body: string; postId: string; parentId?: string }) => {
    createMutation.mutate(data);
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-display font-semibold text-text mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Comments
      </h2>

      {/* New comment editor */}
      {!isLocked ? (
        <div className="mb-6">
          <CommentEditor
            postId={postId}
            onSubmit={handleSubmit}
            isPending={createMutation.isPending}
          />
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-border bg-bg3 p-4 text-center text-sm text-subtext">
          🔒 This post is locked. New comments are not allowed.
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="py-8">
          <Loader text="Loading comments..." />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center text-sm text-subtext">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30 text-subtext" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
