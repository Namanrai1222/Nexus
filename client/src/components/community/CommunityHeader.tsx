import { Users, Shield, Globe, Lock, Clock, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import type { Community } from '../../types';
import { formatDate, formatCount } from '../../utils/formatDate';

const typeIcons: Record<string, React.ReactNode> = {
  EVERGREEN: <Globe className="w-3.5 h-3.5" />,
  TIMEBOUNDED: <Clock className="w-3.5 h-3.5" />,
  PRIVATE: <Lock className="w-3.5 h-3.5" />,
  FEDERATED: <Shield className="w-3.5 h-3.5" />,
  ANONYMOUS: <Users className="w-3.5 h-3.5" />,
};

interface CommunityHeaderProps {
  community: Community;
  isMember: boolean;
  isAuthenticated: boolean;
  onJoin: () => void;
  onLeave: () => void;
  joinPending?: boolean;
  leavePending?: boolean;
}

export default function CommunityHeader({
  community,
  isMember,
  isAuthenticated,
  onJoin,
  onLeave,
  joinPending = false,
  leavePending = false,
}: CommunityHeaderProps) {
  return (
    <div className="card-nx overflow-hidden mb-6">
      {community.bannerUrl ? (
        <img src={community.bannerUrl} alt="Banner" className="w-full h-36 sm:h-48 object-cover" />
      ) : (
        <div className="w-full h-36 sm:h-48 bg-gradient-to-r from-purple/20 via-bg3 to-cyan/10" />
      )}

      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="-mt-14 sm:-mt-16">
            {community.iconUrl ? (
              <img
                src={community.iconUrl}
                alt={community.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-4 border-card object-cover"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-4 border-card bg-purple/20 flex items-center justify-center text-2xl font-display font-bold text-purple">
                {community.name[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-display font-bold text-text">r/{community.name}</h1>
              <span className="badge-nx gap-1 text-xs">
                {typeIcons[community.type]}
                {community.type}
              </span>
            </div>

            {community.description && (
              <p className="text-sm text-subtext mt-1 line-clamp-2">{community.description}</p>
            )}

            <div className="flex items-center gap-4 mt-3 text-sm text-subtext">
              <span className="flex items-center gap-1.5">
                <Users size={14} />
                {formatCount(community._count?.members ?? 0)} members
              </span>
              <span>{formatCount(community._count?.posts ?? 0)} posts</span>
              <span>Created {formatDate(community.createdAt)}</span>
            </div>
          </div>

          {isAuthenticated && (
            <div className="shrink-0">
              {isMember ? (
                <button
                  onClick={onLeave}
                  disabled={leavePending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium text-subtext hover:border-red/40 hover:text-red transition-colors disabled:opacity-50"
                >
                  {leavePending ? <Loader2 size={14} className="animate-spin" /> : <UserMinus size={14} />}
                  Leave
                </button>
              ) : (
                <button
                  onClick={onJoin}
                  disabled={joinPending}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  {joinPending ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  Join
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
