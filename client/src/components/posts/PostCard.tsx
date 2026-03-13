import { Link } from 'react-router-dom';
import { MessageSquare, Eye, Pin, Lock, ExternalLink, Image } from 'lucide-react';
import type { Post } from '../../types';
import VoteButtons from './VoteButtons';
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

  const postUrl = `/r/${post.community.slug}/post/${post.slug}`;

  return (
    <article
      className={cn(
        'group card-nx hover:border-purple/30 transition-colors',
        post.isPinned && 'ring-1 ring-purple/20'
      )}
    >
      <div className="flex">
        {/* Vote column */}
        <div className="hidden sm:flex flex-col items-center py-3 px-2 bg-bg3/50 rounded-l-xl">
          <VoteButtons
            score={post.score}
            onVote={handleVote}
            isVoting={voteMutation.isPending}
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 min-w-0">
          {/* Meta line */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-subtext mb-1">
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
              <div className="w-4 h-4 rounded-full bg-purple/20 flex items-center justify-center text-[8px] font-bold text-purple">
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
          <Link to={postUrl} className="block group/title">
            <h2 className="text-base font-semibold leading-snug text-text group-hover/title:text-purple transition-colors line-clamp-2">
              {post.type === 'LINK' && <ExternalLink className="inline w-4 h-4 mr-1 opacity-60" />}
              {post.type === 'IMAGE' && <Image className="inline w-4 h-4 mr-1 opacity-60" />}
              {post.title}
            </h2>
          </Link>

          {/* Body preview */}
          {post.body && post.type === 'TEXT' && (
            <p className="mt-1 text-sm text-subtext line-clamp-2">{post.body}</p>
          )}

          {/* Image preview */}
          {post.imageUrl && (
            <Link to={postUrl} className="block mt-2">
              <img src={post.imageUrl} alt={post.title} className="max-h-64 rounded-lg object-cover" />
            </Link>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {post.tags.map((pt) => (
                <span key={pt.tag.id} className="tag-nx text-[10px]">#{pt.tag.name}</span>
              ))}
            </div>
          )}

          {/* Actions bar */}
          <div className="flex items-center gap-4 mt-2 text-xs text-subtext">
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
              to={postUrl}
              className="flex items-center gap-1.5 hover:text-text transition-colors"
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
