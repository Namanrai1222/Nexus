import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { MessageSquare, Eye, Pin, Lock, Pencil, Trash2, ExternalLink, X, Check, Loader2 } from 'lucide-react';
import type { Post } from '../../types';
import VoteButtons from './VoteButtons';
import { formatDate, formatCount } from '../../utils/formatDate';
import { useVotePost, useDeletePost, useUpdatePost } from '../../hooks/usePosts';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';

interface PostDetailProps {
  post: Post;
}

export default function PostDetail({ post }: PostDetailProps) {
  const voteMutation = useVotePost();
  const deleteMutation = useDeletePost();
  const updateMutation = useUpdatePost();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAuthor = user?.id === post.authorId;

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editBody, setEditBody] = useState(post.body);

  const handleVote = (value: 1 | -1) => {
    voteMutation.mutate({ postId: post.id, value });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate(post.id, {
        onSuccess: () => navigate('/'),
      });
    }
  };

  const handleEdit = () => {
    setEditTitle(post.title);
    setEditBody(post.body);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(post.title);
    setEditBody(post.body);
  };

  const handleSaveEdit = () => {
    updateMutation.mutate(
      { postId: post.id, title: editTitle, body: editBody },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  return (
    <article className="card-nx overflow-hidden">
      <div className="flex">
        {/* Vote column */}
        <div className="hidden sm:flex flex-col items-center py-4 px-3 bg-bg3/50">
          <VoteButtons
            score={post.score}
            onVote={handleVote}
            isVoting={voteMutation.isPending}
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 min-w-0">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-subtext mb-3">
            <Link
              to={`/r/${post.community.slug}`}
              className="font-semibold text-text hover:text-purple transition-colors"
            >
              r/{post.community.name}
            </Link>
            <span>•</span>
            <Link
              to={`/u/${post.author.username}`}
              className="flex items-center gap-1 hover:text-text transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-purple/20 flex items-center justify-center text-[9px] font-bold text-purple">
                {post.author.username[0].toUpperCase()}
              </div>
              {post.author.username}
            </Link>
            <span>•</span>
            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            {post.isPinned && <Pin className="w-3 h-3 text-purple" />}
            {post.isLocked && <Lock className="w-3 h-3 text-yellow" />}
          </div>

          {/* Title */}
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="input-nx text-xl sm:text-2xl font-display font-bold mb-4"
              maxLength={300}
            />
          ) : (
            <h1 className="text-xl sm:text-2xl font-display font-bold leading-tight text-text mb-4">
              {post.title}
            </h1>
          )}

          {/* Link */}
          {post.type === 'LINK' && post.linkUrl && (
            <a
              href={post.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-4"
            >
              <ExternalLink className="w-4 h-4" />
              {new URL(post.linkUrl).hostname}
            </a>
          )}

          {/* Image */}
          {post.imageUrl && (
            <div className="mb-4">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="max-w-full max-h-[500px] rounded-lg object-contain"
              />
            </div>
          )}

          {/* Body (Markdown) */}
          {isEditing ? (
            <div className="mb-4">
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={8}
                className="input-nx resize-y min-h-[150px] font-mono text-sm w-full"
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                  className="btn-primary py-1.5 px-4 text-sm flex items-center gap-1.5"
                >
                  {updateMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-border text-sm text-subtext hover:text-text transition-colors"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </div>
          ) : post.body ? (
            <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
              <ReactMarkdown>{post.body}</ReactMarkdown>
            </div>
          ) : null}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map((pt) => (
                <span key={pt.tag.id} className="tag-nx text-xs">#{pt.tag.name}</span>
              ))}
            </div>
          )}

          {/* Actions bar */}
          <div className="flex items-center gap-4 pt-3 border-t border-border text-xs text-subtext">
            <div className="sm:hidden">
              <VoteButtons
                score={post.score}
                onVote={handleVote}
                isVoting={voteMutation.isPending}
                layout="horizontal"
                size="sm"
              />
            </div>

            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              {formatCount(post._count?.comments ?? 0)} comments
            </span>

            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {formatCount(post.viewCount)} views
            </span>

            {isAuthor && (
              <>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1.5 hover:text-text transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className={cn(
                    'flex items-center gap-1.5 hover:text-red transition-colors',
                    deleteMutation.isPending && 'opacity-50'
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
