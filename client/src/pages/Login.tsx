import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Login() {
  usePageTitle('Log In');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Valid email required';
    if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      if (data.data) {
        setAuth(data.data.user, data.data.accessToken);
        toast.success(`Welcome back, ${data.data.user.username}!`);
        const redirect = searchParams.get('redirect') || '/feed';
        navigate(redirect);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-purple flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">N</span>
            </div>
            <span className="font-display font-bold text-lg text-text">Nexus</span>
          </Link>

          <h1 className="font-display font-bold text-3xl text-text mb-2">Welcome back</h1>
          <p className="text-subtext mb-8">Sign in to continue to your feed</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-nx"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-nx pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtext hover:text-text"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red text-xs mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In →'}
            </button>
          </form>

          <p className="mt-6 text-sm text-subtext text-center">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-purple hover:underline">Register &rarr;</Link>
          </p>
        </div>
      </div>

      {/* Right — Brand panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-purple/20 via-bg3 to-cyan/10 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="relative z-10 text-center px-12">
          <h2 className="font-display font-bold text-4xl text-text mb-4">
            Where Communities
            <br />
            <span className="gradient-text">Connect</span>
          </h2>
          <p className="text-subtext text-lg">
            Join thousands of developers, creators, and communities already on Nexus.
          </p>
        </div>
      </div>
    </div>
  );
}
