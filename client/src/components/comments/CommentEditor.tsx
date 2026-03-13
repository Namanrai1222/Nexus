import { useState, type FormEvent } from 'react';
import { Loader2, Send } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

interface CommentEditorProps {
  postId: string;
  parentId?: string;
  onSubmit: (data: { body: string; postId: string; parentId?: string }) => void;
  isPending?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
}

export default function CommentEditor({
  postId,
  parentId,
  onSubmit,
  isPending,
  placeholder = 'What are your thoughts?',
  autoFocus = false,
  onCancel,
}: CommentEditorProps) {
  const [body, setBody] = useState('');
  const { user } = useAuthStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    onSubmit({ body: body.trim(), postId, parentId });
    setBody('');
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-border bg-bg3 p-4 text-center text-sm text-subtext">
        <a href="/login" className="text-purple hover:underline font-medium">
          Log in
        </a>{' '}
        or{' '}
        <a href="/register" className="text-purple hover:underline font-medium">
          sign up
        </a>{' '}
        to leave a comment.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={cn(
          'rounded-xl border border-border focus-within:border-purple/50 focus-within:ring-1 focus-within:ring-purple/20 transition-all bg-card',
          parentId && 'border-dashed'
        )}
      >
        <div className="px-3 py-2 text-xs text-subtext">
          Comment as <span className="font-medium text-text">{user?.username}</span>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={parentId ? 3 : 4}
          className="w-full px-3 pb-2 bg-transparent text-sm text-text resize-y focus:outline-none min-h-[60px] placeholder:text-subtext"
        />
        <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-border bg-bg3/50 rounded-b-xl">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-medium text-subtext hover:text-text transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isPending || !body.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple text-white text-xs font-medium hover:bg-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            Reply
          </button>
        </div>
      </div>
    </form>
  );
}
