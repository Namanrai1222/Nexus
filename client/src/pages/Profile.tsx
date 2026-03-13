import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Award, FileText, MessageSquare, Settings, Camera } from 'lucide-react';
import { userApi } from '../api/userApi';
import PostCard from '../components/posts/PostCard';
import { PageLoader } from '../components/shared/Loader';
import { formatDate, formatCount } from '../utils/formatDate';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/cn';
import type { User } from '../types';
import { usePageTitle } from '../hooks/usePageTitle';

type Tab = 'posts' | 'about';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const [tab, setTab] = useState<Tab>('posts');
  const currentUser = useAuthStore((s) => s.user);
  const isOwnProfile = currentUser?.username === username;

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['user', username],
    queryFn: async () => {
      const { data } = await userApi.getProfile(username!);
      return data.data as User;
    },
    enabled: !!username,
  });

  usePageTitle(profile ? `${profile.displayName || profile.username}` : undefined);

  if (isLoading) return <PageLoader />;

  if (isError || !profile) {
    return (
      <div className="text-center py-16 card-nx">
        <p className="text-lg font-display font-bold text-text">User not found</p>
        <p className="text-sm text-subtext mt-1">This user doesn&apos;t exist or has been removed.</p>
        <Link to="/feed" className="btn-primary mt-4 inline-block text-sm">Back to Feed</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile header */}
      <div className="card-nx overflow-hidden mb-6">
        {/* Banner */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-purple/20 via-bg3 to-cyan/10 relative">
          {isOwnProfile && (
            <button className="absolute bottom-2 right-2 p-1.5 bg-bg/60 rounded-lg text-subtext hover:text-text text-xs flex items-center gap-1">
              <Camera size={12} /> Edit Banner
            </button>
          )}
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="-mt-12">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.username}
                  className="w-20 h-20 rounded-xl border-4 border-card object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl border-4 border-card bg-purple/20 flex items-center justify-center text-2xl font-display font-bold text-purple">
                  {profile.username[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-display font-bold text-text">
                  {profile.displayName || profile.username}
                </h1>
                {profile.role !== 'USER' && (
                  <span className="badge-nx text-xs">{profile.role}</span>
                )}
                {isOwnProfile && (
                  <Link to="/settings" className="ml-auto btn-ghost text-xs py-1 px-3">
                    <Settings size={12} className="inline mr-1" /> Edit Profile
                  </Link>
                )}
              </div>
              <p className="text-sm text-subtext">u/{profile.username}</p>

              {profile.bio && (
                <p className="text-sm text-subtext mt-2">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-subtext">
                <span className="flex items-center gap-1.5">
                  <Award size={14} className="text-purple" />
                  {formatCount(profile.impactScore)} impact
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText size={14} />
                  {profile._count?.posts ?? 0} posts
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare size={14} />
                  {profile._count?.comments ?? 0} comments
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  Joined {formatDate(profile.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-4">
        {(['posts', 'about'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize',
              tab === t
                ? 'border-purple text-purple'
                : 'border-transparent text-subtext hover:text-text'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'posts' ? (
        <UserPosts username={username!} />
      ) : (
        <div className="card-nx p-6">
          <h2 className="font-display font-bold text-text mb-3">About</h2>
          <p className="text-sm text-subtext">
            {profile.bio || 'This user hasn\'t written a bio yet.'}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-bg3 rounded-lg p-3">
              <p className="text-subtext text-xs">Impact Score</p>
              <p className="text-lg font-bold text-purple">{formatCount(profile.impactScore)}</p>
            </div>
            <div className="bg-bg3 rounded-lg p-3">
              <p className="text-subtext text-xs">Communities</p>
              <p className="text-lg font-bold text-text">{profile._count?.communities ?? 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserPosts({ username }: { username: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['userPosts', username],
    queryFn: async () => {
      const { data } = await userApi.getPosts(username);
      return data.data;
    },
  });

  if (isLoading) return <PageLoader />;

  const posts = data?.posts ?? [];

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 card-nx">
        <p className="text-sm text-subtext">No posts yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
