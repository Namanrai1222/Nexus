import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Communities', href: '#communities' },
  { label: 'Testimonials', href: '#testimonials' },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-bg2/95 backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="container-nx flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">N</span>
          </div>
          <span className="font-display font-bold text-lg text-text">Nexus</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-subtext hover:text-text transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link to="/feed" className="btn-primary text-sm">
              Go to Feed &rarr;
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="btn-ghost text-sm py-2 px-4"
              >
                Log In
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">
                Get Started &rarr;
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-text"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-bg2 border-b border-border px-6 pb-6 pt-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-subtext hover:text-text transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 mt-4">
            {user ? (
              <Link to="/feed" className="btn-primary text-sm text-center" onClick={() => setMobileOpen(false)}>
                Go to Feed &rarr;
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm text-center" onClick={() => setMobileOpen(false)}>
                  Log In
                </Link>
                <Link to="/register" className="btn-primary text-sm text-center" onClick={() => setMobileOpen(false)}>
                  Get Started &rarr;
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
