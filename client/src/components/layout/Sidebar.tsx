import { Link, useLocation } from 'react-router-dom';
import { Home, Flame, TrendingUp, Users, Compass, PlusCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { communityApi } from '../../api/communityApi';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/?sort=hot', icon: Flame, label: 'Hot' },
  { to: '/?sort=new', icon: TrendingUp, label: 'New' },
  { to: '/?sort=top', icon: TrendingUp, label: 'Top' },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuthStore();

  const { data: communitiesData } = useQuery({
    queryKey: ['communities', 'sidebar'],
    queryFn: async () => {
      const { data } = await communityApi.getAll({ page: 1 });
      return data.data;
    },
  });

  const communities = communitiesData?.communities ?? [];

  return (
    <aside className="hidden lg:block w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-6 pr-4">
      {/* Navigation */}
      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/' && !location.search
              : location.pathname + location.search === item.to;

          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-border" />

      {/* Communities */}
      <div>
        <div className="flex items-center justify-between px-3 mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Communities
          </h3>
          {user && (
            <Link to="/create-community" className="text-muted-foreground hover:text-foreground">
              <PlusCircle className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="space-y-1">
          {communities.slice(0, 10).map((community) => (
            <Link
              key={community.id}
              to={`/c/${community.slug}`}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                location.pathname === `/c/${community.slug}`
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {community.iconUrl ? (
                <img
                  src={community.iconUrl}
                  alt={community.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">
                    {community.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="truncate">{community.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {community._count?.members ?? 0}
              </span>
            </Link>
          ))}

          {communities.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">No communities yet</p>
          )}

          {communities.length > 10 && (
            <Link
              to="/communities"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary hover:bg-accent transition-colors"
            >
              <Compass className="w-5 h-5" />
              Explore all
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 px-3">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Nexus. Built with React + Express.
        </p>
      </div>
    </aside>
  );
}
