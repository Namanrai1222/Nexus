import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Loader2, Save, Bell, BellOff, Shield, LogOut } from 'lucide-react';
import { userApi } from '../api/userApi';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Settings() {
  usePageTitle('Settings');
  const { user, setAuth } = useAuthStore();
  const { mutate: logout } = useLogout();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');

  // Notification preferences (client-side only for now)
  const [notifyReplies, setNotifyReplies] = useState(true);
  const [notifyVotes, setNotifyVotes] = useState(true);
  const [notifyMentions, setNotifyMentions] = useState(true);

  const updateMutation = useMutation({
    mutationFn: () => userApi.updateProfile({ displayName, bio }),
    onSuccess: (res) => {
      const updated = res.data.data;
      if (updated && user) {
        setAuth({ ...user, ...updated }, '');
      }
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile updated!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadAvatar(file),
    onSuccess: (res) => {
      const url = res.data.data?.avatarUrl;
      if (url && user) {
        setAuth({ ...user, avatarUrl: url }, '');
      }
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Avatar updated!');
    },
    onError: () => toast.error('Failed to upload avatar'),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) avatarMutation.mutate(file);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-text mb-6">Settings</h1>

      {/* Avatar */}
      <div className="card-nx p-6 mb-6">
        <h2 className="text-sm font-semibold text-text mb-4">Profile Picture</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-purple/20 flex items-center justify-center text-xl font-bold text-purple">
                {user?.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple rounded-full flex items-center justify-center cursor-pointer hover:bg-purple/80 transition-colors">
              {avatarMutation.isPending ? (
                <Loader2 size={12} className="animate-spin text-white" />
              ) : (
                <Camera size={12} className="text-white" />
              )}
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <div>
            <p className="text-sm text-text font-medium">{user?.username}</p>
            <p className="text-xs text-subtext">Click the camera icon to change</p>
          </div>
        </div>
      </div>

      {/* Profile info */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateMutation.mutate();
        }}
        className="card-nx p-6 space-y-4"
      >
        <h2 className="text-sm font-semibold text-text mb-2">Profile Information</h2>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input-nx"
            placeholder="Your display name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="input-nx resize-y"
            placeholder="Tell everyone a bit about yourself..."
            maxLength={300}
          />
          <p className="text-xs text-subtext mt-1">{bio.length}/300</p>
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="btn-primary py-2.5 px-6"
        >
          {updateMutation.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Save size={14} className="inline mr-1" /> Save Changes
            </>
          )}
        </button>
      </form>

      {/* Notification Preferences */}
      <div className="card-nx p-6 mt-6">
        <h2 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
          <Bell size={16} />
          Notification Preferences
        </h2>
        <div className="space-y-3">
          <NotificationToggle
            label="Comment replies"
            description="Get notified when someone replies to your comments"
            checked={notifyReplies}
            onChange={setNotifyReplies}
          />
          <NotificationToggle
            label="Votes on your posts"
            description="Get notified when your posts receive votes"
            checked={notifyVotes}
            onChange={setNotifyVotes}
          />
          <NotificationToggle
            label="Mentions"
            description="Get notified when someone mentions you"
            checked={notifyMentions}
            onChange={setNotifyMentions}
          />
        </div>
      </div>

      {/* Account */}
      <div className="card-nx p-6 mt-6">
        <h2 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
          <Shield size={16} />
          Account
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-text">Email</p>
              <p className="text-xs text-subtext">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-text">Member since</p>
              <p className="text-xs text-subtext">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-text">Role</p>
              <p className="text-xs text-subtext capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <div className="pt-3 border-t border-border">
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-sm text-red hover:text-red/80 transition-colors"
            >
              <LogOut size={14} />
              Sign out of all devices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-text">{label}</p>
        <p className="text-xs text-subtext">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-purple' : 'bg-bg3 border border-border'}`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
}
