import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PenSquare, LogOut, User, Settings, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLogout } from '../../hooks/useAuth';
import NotificationBell from '../shared/NotificationBell';

export default function AppNav() {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/feed?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg2/95 backdrop-blur-md border-b border-border">
      <div className="container-nx flex items-center justify-between h-14 gap-4">
        {/* Logo */}
        <Link to="/feed" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-purple flex items-center justify-center">
            <span className="text-white font-display font-bold text-xs">N</span>
          </div>
          <span className="font-display font-bold text-text hidden sm:inline">Nexus</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, communities..."
              className="input-nx pl-9 py-2 text-sm"
            />
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/submit" className="btn-primary py-1.5 px-3 text-sm hidden sm:inline-flex">
                <PenSquare size={14} />
                New Post
              </Link>

              <NotificationBell />

              {/* Avatar dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-8 h-8 rounded-full bg-purple/20 flex items-center justify-center text-purple text-sm font-bold hover:ring-2 ring-purple/30 transition-all"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-50 py-1">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-sm font-medium text-text">{user.displayName || user.username}</p>
                        <p className="text-xs text-subtext">@{user.username}</p>
                      </div>
                      <Link
                        to={`/u/${user.username}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-subtext hover:text-text hover:bg-bg3 transition-colors"
                      >
                        <User size={14} /> Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-subtext hover:text-text hover:bg-bg3 transition-colors"
                      >
                        <Settings size={14} /> Settings
                      </Link>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logoutMutation.mutate();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red hover:bg-bg3 transition-colors"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost py-1.5 px-3 text-sm">Log In</Link>
              <Link to="/register" className="btn-primary py-1.5 px-3 text-sm">Sign Up</Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-subtext"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border px-4 pb-4 pt-3 bg-bg2">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="input-nx py-2 text-sm"
            />
          </form>
          {user && (
            <Link
              to="/submit"
              onClick={() => setMobileOpen(false)}
              className="btn-primary w-full mt-3 text-sm justify-center"
            >
              <PenSquare size={14} /> New Post
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
