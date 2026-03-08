import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Comment } from '../../types';
import VoteButtons from '../posts/VoteButtons';
import Avatar from '../shared/Avatar';
import CommentEditor from './CommentEditor';
import { formatDate } from '../../utils/formatDate';
import { useVoteComment, useDeleteComment, useCreateComment } from '../../hooks/useComments';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  depth?: number;
}

const MAX_DEPTH = 4;

export default function CommentItem({ comment, postId, depth = 0 }: CommentItemProps) {
  const [showReply, setShowReply] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const voteMutation = useVoteComment();
  const deleteMutation = useDeleteComment();
  const createMutation = useCreateComment();
  const { user } = useAuthStore();
  const isAuthor = user?.id === comment.authorId;

  const handleVote = (value: 1 | -1) => {
    voteMutation.mutate({ commentId: comment.id, value });
  };

  const handleDelete = () => {
    if (confirm('Delete this comment?')) {
      deleteMutation.mutate(comment.id);
    }
  };

  const handleReply = (data: { body: string; postId: string; parentId?: string }) => {
    createMutation.mutate(data, {
      onSuccess: () => setShowReply(false),
    });
  };

  if (comment.isDeleted) {
    return (
      <div className={cn('py-2', depth > 0 && 'ml-6 border-l-2 border-border pl-4')}>
        <p className="text-sm text-muted-foreground italic">[deleted]</p>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('py-2', depth > 0 && 'ml-6 border-l-2 border-border pl-4')}>
      {/* Comment header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>
        <Link to={`/u/${comment.author.username}`} className="flex items-center gap-1.5">
          <Avatar
            src={comment.author.avatarUrl}
            username={comment.author.username}
            size="sm"
            className="w-5 h-5 ring-0"
          />
          <span className="text-xs font-medium hover:text-primary transition-colors">
            {comment.author.username}
          </span>
        </Link>
        <span className="text-xs text-muted-foreground">•</span>
        <time className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</time>
      </div>

      {!collapsed && (
        <>
          {/* Comment body */}
          <div className="ml-5 mt-1">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{comment.body}</ReactMarkdown>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <VoteButtons
                score={comment.score}
                onVote={handleVote}
                isVoting={voteMutation.isPending}
                layout="horizontal"
                size="sm"
              />

              {depth < MAX_DEPTH && (
                <button
                  onClick={() => setShowReply(!showReply)}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Reply
                </button>
              )}

              {isAuthor && (
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-1 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>

            {/* Reply editor */}
            {showReply && (
              <div className="mt-3">
                <CommentEditor
                  postId={postId}
                  parentId={comment.id}
                  onSubmit={handleReply}
                  isPending={createMutation.isPending}
                  placeholder={`Reply to ${comment.author.username}...`}
                  autoFocus
                  onCancel={() => setShowReply(false)}
                />
              </div>
            )}
          </div>

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-1">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
