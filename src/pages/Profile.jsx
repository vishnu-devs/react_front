import React, { useEffect, useState } from 'react';
import { getCurrentUser as getStoredUser, setAuthData } from '../utils/auth';
import { getCurrentUser as fetchCurrentUser, updateProfile, uploadAvatar, changePassword, sendForgotPasswordLink } from '../api/auth';
import { getToken } from '../utils/tokenStorage';
import { logError } from '../utils/errorLogger';
import Button from '../components/Button';
import { toast } from 'react-hot-toast';
import API from '../api/axiosConfig';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [resetSending, setResetSending] = useState(false);

  const resolveAvatarUrl = (avatar) => {
    if (!avatar) return null;
    // If avatar is already a full URL (e.g., Google photo), use as-is
    if (/^https?:\/\//i.test(avatar)) return avatar;
    // Otherwise, map storage path (e.g., "avatars/xyz.jpg") to backend public URL
    let origin = '';
    try {
      origin = new URL(API.defaults.baseURL).origin; // e.g., http://localhost:8000
    } catch (_) {
      origin = '';
    }
    const path = String(avatar).replace(/^\/+/, '');
    return `${origin}/storage/${path}`;
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Show locally stored user details immediately
        const localUser = await getStoredUser();
        if (localUser) {
          setUser(localUser);
          setLoading(false);
        }
        // Attempt to fetch fresh user details from backend
        const res = await fetchCurrentUser();
        if (res?.data?.data?.user) {
          setUser(res.data.data.user);
        }
      } catch (err) {
        const details = await logError(err, 'Fetching current user profile');
        setError(details.message);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const persistUserLocally = async (updatedUser) => {
    try {
      const tokenData = await getToken();
      await setAuthData(tokenData?.token || '', updatedUser, updatedUser?.role || updatedUser?.roles?.[0] || 'user');
    } catch (e) {
      // Non-blocking
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      const res = await updateProfile(profileForm);
      const updated = res?.data?.data?.user || res?.data?.user || res?.data || {};
      setUser((prev) => ({ ...prev, ...updated }));
      await persistUserLocally(updated);
      toast.success('Profile updated successfully');
    } catch (err) {
      const details = await logError(err, 'Updating profile');
      setError(details.message);
      toast.error(details.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      toast.error('Please select an image to upload');
      return;
    }
    try {
      setAvatarUploading(true);
      const res = await uploadAvatar(avatarFile);
      const updatedAvatar = res?.data?.data?.avatar || res?.data?.avatar || null;
      setUser((prev) => ({ ...prev, avatar: updatedAvatar }));
      await persistUserLocally({ ...(user || {}), avatar: updatedAvatar });
      toast.success('Profile picture updated');
      setAvatarFile(null);
    } catch (err) {
      const details = await logError(err, 'Uploading avatar');
      setError(details.message);
      toast.error(details.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      setPasswordSaving(true);
      await changePassword(passwordForm.current_password, passwordForm.password, passwordForm.password_confirmation);
      toast.success('Password changed successfully');
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      const details = await logError(err, 'Changing password');
      setError(details.message);
      toast.error(details.message);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    try {
      setResetSending(true);
      await sendForgotPasswordLink(profileForm.email);
      toast.success('Password reset link sent to your email');
    } catch (err) {
      const details = await logError(err, 'Sending forgot password link');
      setError(details.message);
      toast.error(details.message);
    } finally {
      setResetSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-gray-600">No user data available.</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
      <h2 className="text-3xl font-bold mb-6">My Profile</h2>

      {/* Current Details */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            {user.avatar ? (
              <img src={resolveAvatarUrl(user.avatar)} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
            )}
          </div>
          <div>
            <div className="text-lg font-semibold">{user.name || '—'}</div>
            <div className="text-gray-600">{user.email || '—'}</div>
            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 rounded">
              {(user.role || user?.roles?.[0] || 'user').toString()}
            </span>
          </div>
        </div>
      </div>

      {/* Update Details Form */}
      <form onSubmit={handleProfileSubmit} className="space-y-4 mb-8">
        <h3 className="text-xl font-semibold">Update Details</h3>
        <div>
          <label className="block text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={profileForm.name}
            onChange={handleProfileChange}
            className="w-full border border-gray-300 rounded-lg p-3"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={profileForm.email}
            onChange={handleProfileChange}
            className="w-full border border-gray-300 rounded-lg p-3"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={profileForm.phone}
            onChange={handleProfileChange}
            className="w-full border border-gray-300 rounded-lg p-3"
            placeholder="e.g. 9876543210"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={profileSaving}>
            {profileSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* Avatar Upload */}
      <div className="space-y-3 mb-8">
        <h3 className="text-xl font-semibold">Profile Picture</h3>
        <input type="file" accept="image/*" onChange={handleAvatarChange} className="w-full border border-gray-300 rounded-lg p-2" />
        <div className="flex justify-end">
          <Button onClick={handleAvatarUpload} variant="secondary" disabled={avatarUploading}>
            {avatarUploading ? 'Uploading...' : 'Upload Avatar'}
          </Button>
        </div>
      </div>

      {/* Change Password */}
      <form onSubmit={handlePasswordSubmit} className="space-y-4 mb-8">
        <h3 className="text-xl font-semibold">Change Password</h3>
        <div>
          <label className="block text-gray-700 mb-1">Current Password</label>
          <input
            type="password"
            name="current_password"
            value={passwordForm.current_password}
            onChange={handlePasswordChange}
            className="w-full border border-gray-300 rounded-lg p-3"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            name="password"
            value={passwordForm.password}
            onChange={handlePasswordChange}
            className="w-full border border-gray-300 rounded-lg p-3"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            name="password_confirmation"
            value={passwordForm.password_confirmation}
            onChange={handlePasswordChange}
            className="w-full border border-gray-300 rounded-lg p-3"
            required
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={passwordSaving}>
            {passwordSaving ? 'Saving...' : 'Change Password'}
          </Button>
        </div>
      </form>

      {/* Forgot Password */}
      <form onSubmit={handleSendResetLink} className="space-y-3">
        <h3 className="text-xl font-semibold">Forgot Password</h3>
        <p className="text-gray-600 text-sm">हम आपकी ईमेल पर रीसेट लिंक भेज देंगे।</p>
        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="reset_email"
            value={profileForm.email}
            onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg p-3"
            required
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="secondary" disabled={resetSending}>
            {resetSending ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </div>
      </form>
    </div>
  );
}