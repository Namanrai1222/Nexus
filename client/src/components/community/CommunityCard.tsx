import { Link } from 'react-router-dom';
import { Users, FileText } from 'lucide-react';
import type { Community } from '../../types';

interface CommunityCardProps {
  community: Community;
  showJoin?: boolean;
}

export default function CommunityCard({ community, showJoin = true }: CommunityCardProps) {
  const initial = community.name.charAt(0).toUpperCase();
  const memberCount = community._count?.members ?? 0;
  const postCount = community._count?.posts ?? 0;

  return (
    <Link
      to={`/r/${community.slug}`}
      className="card-nx group hover:-translate-y-1 hover:shadow-lg hover:shadow-purple/5 transition-all duration-300 flex flex-col"
    >
      <div className="flex items-center gap-3 mb-3">
        {community.iconUrl ? (
          <img
            src={community.iconUrl}
            alt={community.name}
            className="w-10 h-10 rounded-lg object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-purple/20 flex items-center justify-center">
            <span className="font-display font-bold text-purple text-sm">{initial}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-sm text-text truncate">
            {community.name}
          </h3>
          <p className="text-xs text-subtext truncate">
            {community.description || 'No description'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-subtext mt-auto">
        <span className="flex items-center gap-1">
          <Users size={12} /> {memberCount.toLocaleString()} members
        </span>
        <span className="flex items-center gap-1">
          <FileText size={12} /> {postCount.toLocaleString()} posts
        </span>
      </div>

      {showJoin && (
        <div className="mt-3 pt-3 border-t border-border">
          <span className="text-xs font-medium text-purple group-hover:underline">
            View &rarr;
          </span>
        </div>
      )}
    </Link>
  );
}
