import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatCount } from '../../utils/formatDate';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface VoteButtonsProps {
  score: number;
  onVote: (value: 1 | -1) => void;
  isVoting?: boolean;
  layout?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md';
}

export default function VoteButtons({
  score,
  onVote,
  isVoting = false,
  layout = 'vertical',
  size = 'md',
}: VoteButtonsProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  const handleVote = (value: 1 | -1) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }
    if (isVoting) return;
    onVote(value);
  };

  const iconSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  const isVertical = layout === 'vertical';

  return (
    <div
      className={cn(
        'flex items-center gap-1',
        isVertical ? 'flex-col' : 'flex-row'
      )}
    >
      <button
        onClick={() => handleVote(1)}
        disabled={isVoting}
        className={cn(
          'p-1 rounded-md hover:bg-purple/10 hover:text-purple transition-colors text-subtext',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Upvote"
      >
        <ArrowBigUp className={iconSize} />
      </button>

      <span
        className={cn(
          'font-bold tabular-nums text-text',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}
      >
        {formatCount(score)}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={isVoting}
        className={cn(
          'p-1 rounded-md hover:bg-red/10 hover:text-red transition-colors text-subtext',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Downvote"
      >
        <ArrowBigDown className={iconSize} />
      </button>
    </div>
  );
}
