import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTopCommunities } from '../../hooks/useLandingData';
import CommunityCard from '../community/CommunityCard';
import type { Community } from '../../types';

function SkeletonCard() {
  return (
    <div className="card-nx">
      <div className="flex items-center gap-3 mb-3">
        <div className="skeleton w-10 h-10 rounded-lg" />
        <div className="flex-1">
          <div className="skeleton h-4 w-28 mb-1" />
          <div className="skeleton h-3 w-full" />
        </div>
      </div>
      <div className="skeleton h-3 w-2/3 mt-2" />
    </div>
  );
}

export default function CommunityShowcase() {
  const { data, isLoading } = useTopCommunities();
  const communities: Community[] = data?.communities ?? data ?? [];

  return (
    <section id="communities" className="section-nx bg-bg2">
      <div className="container-nx">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-text mb-3">
            Find your people
          </h2>
          <p className="text-subtext text-lg">
            Browse communities built around the topics you care about
          </p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-12 card-nx">
            <p className="text-subtext mb-3">No communities yet — create the first one!</p>
            <Link to="/submit" className="btn-primary text-sm">
              Create Community
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.slice(0, 6).map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/feed" className="btn-ghost text-sm inline-flex items-center gap-2">
            Browse all communities <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
