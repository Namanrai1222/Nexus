import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { usePageTitle } from '../hooks/usePageTitle';

function getStrength(pw: string): { label: string; color: string; width: string } {
  if (pw.length < 6) return { label: 'Too short', color: 'bg-red', width: 'w-1/4' };
  const has = { upper: /[A-Z]/.test(pw), num: /\d/.test(pw), special: /[^A-Za-z0-9]/.test(pw) };
  const score = [has.upper, has.num, has.special].filter(Boolean).length;
  if (pw.length >= 12 && score >= 2) return { label: 'Strong', color: 'bg-green', width: 'w-full' };
  if (pw.length >= 8 && score >= 1) return { label: 'Medium', color: 'bg-yellow', width: 'w-2/3' };
  return { label: 'Weak', color: 'bg-orange', width: 'w-1/3' };
}

export default function Register() {
  usePageTitle('Sign Up');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const strength = useMemo(() => getStrength(password), [password]);

  // Auto-generate username from display name
  const handleDisplayName = (val: string) => {
    setDisplayName(val);
    if (!username || username === displayName.toLowerCase().replace(/[^a-z0-9]/gi, '')) {
      setUsername(val.toLowerCase().replace(/[^a-z0-9]/gi, ''));
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!displayName.trim()) e.displayName = 'Display name required';
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) e.username = '3-20 chars, letters/numbers/underscore only';
    if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Valid email required';
    if (password.length < 6) e.password = 'Min 6 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await authApi.register({ username, email, password, displayName });
      if (data.data) {
        setAuth(data.data.user, data.data.accessToken);
        toast.success(`Welcome to Nexus, ${data.data.user.username}!`);
        navigate('/feed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      if (err.response?.status === 409) {
        setErrors({ email: 'Username or email already taken' });
      }
      toast.error(msg);
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

          <h1 className="font-display font-bold text-3xl text-text mb-2">Create your account</h1>
          <p className="text-subtext mb-8">Join Nexus — it&apos;s free forever</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => handleDisplayName(e.target.value)}
                className="input-nx"
                placeholder="Alex Thompson"
              />
              {errors.displayName && <p className="text-red text-xs mt-1">{errors.displayName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-nx"
                placeholder="alexthompson"
              />
              {errors.username && <p className="text-red text-xs mt-1">{errors.username}</p>}
            </div>

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
              {password && (
                <div className="mt-2">
                  <div className="h-1 bg-bg3 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all`} />
                  </div>
                  <p className="text-xs text-subtext mt-1">{strength.label}</p>
                </div>
              )}
              {errors.password && <p className="text-red text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-nx"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account →'}
            </button>
          </form>

          <p className="mt-6 text-sm text-subtext text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-purple hover:underline">Sign in &rarr;</Link>
          </p>
        </div>
      </div>

      {/* Right — Brand panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-purple/20 via-bg3 to-cyan/10 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="relative z-10 text-center px-12">
          <h2 className="font-display font-bold text-4xl text-text mb-4">
            Start your
            <br />
            <span className="gradient-text">journey</span>
          </h2>
          <p className="text-subtext text-lg">
            Create, discuss, and grow with the smartest community platform.
          </p>
        </div>
      </div>
    </div>
  );
}
