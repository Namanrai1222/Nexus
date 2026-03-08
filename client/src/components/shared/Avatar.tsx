import { cn } from '../../utils/cn';

interface AvatarProps {
  src?: string | null;
  username: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-xl',
};

export default function Avatar({ src, username, size = 'md', className }: AvatarProps) {
  const initials = username
    .split(/[_\-\s]/)
    .map((s) => s.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  if (src) {
    return (
      <img
        src={src}
        alt={username}
        className={cn(
          'rounded-full object-cover ring-2 ring-border',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  // Generate a consistent color from username
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
  ];
  const colorIndex = username.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white ring-2 ring-border',
        sizeClasses[size],
        colors[colorIndex],
        className
      )}
    >
      {initials}
    </div>
  );
}
