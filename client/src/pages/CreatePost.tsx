import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import PostEditor from '../components/posts/PostEditor';

export default function CreatePost() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Create a Post</h1>
      <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
        <PostEditor />
      </div>
    </div>
  );
}
