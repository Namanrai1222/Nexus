import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Award, FileText, MessageSquare } from 'lucide-react';
import { userApi } from '../api/userApi';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/posts/PostCard';
import Avatar from '../components/shared/Avatar';
import { PageLoader } from '../components/shared/Loader';
import { formatDate, formatCount } from '../utils/formatDate';
import { cn } from '../utils/cn';
import type { User } from '../types';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const [tab, setTab] = useState<'posts' | 'about'>('posts');

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

  const { data: postsData, isLoading: postsLoading } = usePosts({
    page: 1,
    limit: 20,
  });
  // We'll filter posts client-side for this user; alternatively use userApi.getPosts(username)

  if (isLoading) return <PageLoader />;

  if (isError || !profile) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <p className="text-lg font-medium">User not found</p>
        <p className="text-sm text-muted-foreground mt-1">
          This user doesn&apos;t exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Profile header */}
      <div className="bg-card rounded-lg border border-border p-6 mb-4">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Avatar
            src={profile.avatarUrl}
            username={profile.username}
            size="xl"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">
              {profile.displayName || profile.username}
            </h1>
            <p className="text-sm text-muted-foreground">u/{profile.username}</p>

            {profile.bio && (
              <p className="text-sm mt-2">{profile.bio}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-primary" />
                {formatCount(profile.impactScore)} impact
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                {profile._count?.posts ?? 0} posts
              </span>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                {profile._count?.comments ?? 0} comments
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Joined {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-4">
        {(['posts', 'about'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize',
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
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
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="font-semibold mb-3">About</h2>
          <p className="text-sm text-muted-foreground">
            {profile.bio || 'This user hasn\'t written a bio yet.'}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-muted-foreground">Impact Score</p>
              <p className="text-lg font-bold text-primary">{formatCount(profile.impactScore)}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-muted-foreground">Communities</p>
              <p className="text-lg font-bold">{profile._count?.communities ?? 0}</p>
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
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">No posts yet.</p>
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
