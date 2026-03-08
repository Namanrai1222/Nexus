import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { MessageSquare, Eye, Pin, Lock, Pencil, Trash2, ExternalLink } from 'lucide-react';
import type { Post } from '../../types';
import VoteButtons from './VoteButtons';
import Avatar from '../shared/Avatar';
import Badge from '../shared/Badge';
import { formatDate, formatCount } from '../../utils/formatDate';
import { useVotePost, useDeletePost } from '../../hooks/usePosts';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';

interface PostDetailProps {
  post: Post;
}

export default function PostDetail({ post }: PostDetailProps) {
  const voteMutation = useVotePost();
  const deleteMutation = useDeletePost();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAuthor = user?.id === post.authorId;

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

  return (
    <article className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="flex">
        {/* Vote column */}
        <div className="hidden sm:flex flex-col items-center py-4 px-3 bg-muted/30">
          <VoteButtons
            score={post.score}
            onVote={handleVote}
            isVoting={voteMutation.isPending}
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 min-w-0">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Link
              to={`/c/${post.community.slug}`}
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              c/{post.community.name}
            </Link>
            <span>•</span>
            <Link
              to={`/u/${post.author.username}`}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Avatar
                src={post.author.avatarUrl}
                username={post.author.username}
                size="sm"
                className="w-5 h-5 ring-0"
              />
              {post.author.username}
            </Link>
            <span>•</span>
            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            {post.isPinned && <Pin className="w-3 h-3 text-primary" />}
            {post.isLocked && <Lock className="w-3 h-3 text-yellow-500" />}
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold leading-tight mb-4">
            {post.title}
          </h1>

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
          {post.body && (
            <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
              <ReactMarkdown>{post.body}</ReactMarkdown>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map((pt) => (
                <Badge key={pt.tag.id} variant="secondary">
                  #{pt.tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions bar */}
          <div className="flex items-center gap-4 pt-3 border-t border-border text-xs text-muted-foreground">
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
                  onClick={() => {/* TODO: Inline edit */}}
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className={cn(
                    'flex items-center gap-1.5 hover:text-destructive transition-colors',
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
