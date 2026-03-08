import { Link } from 'react-router-dom';
import { MessageSquare, Eye, Pin, Lock, ExternalLink, Image } from 'lucide-react';
import type { Post } from '../../types';
import VoteButtons from './VoteButtons';
import Avatar from '../shared/Avatar';
import Badge from '../shared/Badge';
import { formatDate, formatCount } from '../../utils/formatDate';
import { useVotePost } from '../../hooks/usePosts';
import { cn } from '../../utils/cn';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const voteMutation = useVotePost();

  const handleVote = (value: 1 | -1) => {
    voteMutation.mutate({ postId: post.id, value });
  };

  return (
    <article
      className={cn(
        'group bg-card rounded-lg border border-border hover:border-primary/30 transition-colors',
        post.isPinned && 'ring-1 ring-primary/20'
      )}
    >
      <div className="flex">
        {/* Vote column */}
        <div className="hidden sm:flex flex-col items-center py-3 px-2 bg-muted/30 rounded-l-lg">
          <VoteButtons
            score={post.score}
            onVote={handleVote}
            isVoting={voteMutation.isPending}
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 min-w-0">
          {/* Meta line */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mb-1">
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
                className="w-4 h-4 ring-0"
              />
              {post.author.username}
            </Link>
            <span>•</span>
            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            {post.isPinned && (
              <Pin className="w-3 h-3 text-primary" />
            )}
            {post.isLocked && (
              <Lock className="w-3 h-3 text-yellow-500" />
            )}
          </div>

          {/* Title */}
          <Link to={`/post/${post.slug}`} className="block group/title">
            <h2 className="text-base font-semibold leading-snug group-hover/title:text-primary transition-colors line-clamp-2">
              {post.type === 'LINK' && (
                <ExternalLink className="inline w-4 h-4 mr-1 opacity-60" />
              )}
              {post.type === 'IMAGE' && (
                <Image className="inline w-4 h-4 mr-1 opacity-60" />
              )}
              {post.title}
            </h2>
          </Link>

          {/* Body preview */}
          {post.body && post.type === 'TEXT' && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {post.body}
            </p>
          )}

          {/* Image preview */}
          {post.imageUrl && (
            <Link to={`/post/${post.slug}`} className="block mt-2">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="max-h-64 rounded-md object-cover"
              />
            </Link>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {post.tags.map((pt) => (
                <Badge key={pt.tag.id} variant="secondary" className="text-[10px]">
                  {pt.tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions bar */}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {/* Mobile vote */}
            <div className="sm:hidden">
              <VoteButtons
                score={post.score}
                onVote={handleVote}
                isVoting={voteMutation.isPending}
                layout="horizontal"
                size="sm"
              />
            </div>

            <Link
              to={`/post/${post.slug}`}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{formatCount(post._count?.comments ?? 0)} comments</span>
            </Link>

            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {formatCount(post.viewCount)} views
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
