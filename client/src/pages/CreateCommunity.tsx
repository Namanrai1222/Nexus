import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ChevronRight, Loader2, Globe, Clock, Lock, Shield, Users } from 'lucide-react';
import { communityApi } from '../api/communityApi';
import { cn } from '../utils/cn';
import { usePageTitle } from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

const communityTypes = [
  { type: 'EVERGREEN', label: 'Evergreen', icon: Globe, desc: 'A permanent community for ongoing discussions' },
  { type: 'TIMEBOUNDED', label: 'Time-Bounded', icon: Clock, desc: 'Auto-archives after a set duration' },
  { type: 'PRIVATE', label: 'Private', icon: Lock, desc: 'Only invited members can view and post' },
  { type: 'FEDERATED', label: 'Federated', icon: Shield, desc: 'Cross-platform linked community' },
  { type: 'ANONYMOUS', label: 'Anonymous', icon: Users, desc: 'Members post under pseudonyms' },
] as const;

export default function CreateCommunity() {
  usePageTitle('Create Community');
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('EVERGREEN');
  const [isPrivate, setIsPrivate] = useState(false);

  const createMutation = useMutation({
    mutationFn: () =>
      communityApi.create({ name, description, type, isPrivate }),
    onSuccess: (res) => {
      const community = res.data.data;
      toast.success('Community created!');
      if (community?.slug) {
        navigate(`/r/${community.slug}`);
      } else {
        navigate('/feed');
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create community');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-subtext mb-4">
        <Link to="/feed" className="hover:text-text transition-colors">Feed</Link>
        <ChevronRight size={14} />
        <span className="text-text">Create Community</span>
      </nav>

      <h1 className="text-2xl font-display font-bold text-text mb-6">Create a Community</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="card-nx p-6">
          <label className="block text-sm font-medium text-text mb-1.5">Community Name</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-subtext text-sm">r/</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              maxLength={50}
              placeholder="mycommunity"
              className="input-nx pl-8"
            />
          </div>
          <p className="text-xs text-subtext mt-1">
            {name.length}/50 — Community names cannot be changed later.
          </p>
        </div>

        {/* Description */}
        <div className="card-nx p-6">
          <label className="block text-sm font-medium text-text mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="What is your community about?"
            className="input-nx resize-y"
          />
          <p className="text-xs text-subtext mt-1">{description.length}/500</p>
        </div>

        {/* Community type */}
        <div className="card-nx p-6">
          <label className="block text-sm font-medium text-text mb-3">Community Type</label>
          <div className="grid gap-2">
            {communityTypes.map(({ type: t, label, icon: Icon, desc }) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  if (t === 'PRIVATE') setIsPrivate(true);
                  else setIsPrivate(false);
                }}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border text-left transition-colors',
                  type === t
                    ? 'border-purple bg-purple/5'
                    : 'border-border hover:border-purple/30'
                )}
              >
                <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', type === t ? 'text-purple' : 'text-subtext')} />
                <div>
                  <p className={cn('text-sm font-medium', type === t ? 'text-text' : 'text-subtext')}>{label}</p>
                  <p className="text-xs text-subtext mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending || !name.trim()}
          className="btn-primary w-full py-3"
        >
          {createMutation.isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            'Create Community'
          )}
        </button>
      </form>
    </div>
  );
}
