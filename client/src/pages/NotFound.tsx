import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export default function NotFound() {
  usePageTitle('Page Not Found');
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg text-center px-4">
      <div className="text-8xl font-black text-purple/20 font-display mb-4">404</div>
      <h1 className="text-2xl font-display font-bold text-text mb-2">Page not found</h1>
      <p className="text-sm text-subtext mb-6 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex items-center gap-3">
        <Link
          to="/feed"
          className="btn-primary px-4 py-2.5 text-sm"
        >
          <Home className="w-4 h-4 inline mr-1" />
          Go to Feed
        </Link>
        <button
          onClick={() => window.history.back()}
          className="btn-ghost px-4 py-2.5 text-sm"
        >
          <ArrowLeft className="w-4 h-4 inline mr-1" />
          Go Back
        </button>
      </div>
    </div>
  );
}
