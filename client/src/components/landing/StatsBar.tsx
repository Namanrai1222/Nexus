import { Users, FileText, Building2, MessageCircle } from 'lucide-react';
import { useLandingStats } from '../../hooks/useLandingData';
import AnimatedCounter from '../shared/AnimatedCounter';

const statsMeta = [
  { key: 'totalUsers' as const, label: 'Users', icon: Users },
  { key: 'totalPosts' as const, label: 'Posts', icon: FileText },
  { key: 'totalCommunities' as const, label: 'Communities', icon: Building2 },
  { key: 'totalComments' as const, label: 'Comments', icon: MessageCircle },
];

export default function StatsBar() {
  const { data: stats } = useLandingStats();

  return (
    <section className="bg-bg2 border-y border-border py-10">
      <div className="container-nx grid grid-cols-2 md:grid-cols-4 gap-8">
        {statsMeta.map(({ key, label, icon: Icon }) => (
          <div key={key} className="text-center">
            <Icon className="w-6 h-6 mx-auto mb-2 text-purple" />
            <p className="font-display font-bold text-3xl text-text">
              <AnimatedCounter end={stats?.[key] ?? 0} />
            </p>
            <p className="text-sm text-subtext mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
