import { getToken, saveToken, removeToken } from './tokenStorage';
import API from '../api/axiosConfig';

export const setAuthData = async (token, user, role) => {
  return await saveToken(token, { ...user, role });
};

export const clearAuthData = async () => {
  return await removeToken();
};

export const isAuthenticated = async () => {
  const tokenData = await getToken();
  return !!tokenData?.token;
};

export const getUserRole = async () => {
  const tokenData = await getToken();
  let role = tokenData?.user?.role || null;

  // Try to fetch fresh user details from backend to avoid stale role
  try {
    const res = await API.get('/v1/user');
    const freshUser = res?.data?.data?.user || res?.data?.user || res?.data || null;
    if (freshUser) {
      const freshRole = freshUser.role || freshUser.roles?.[0] || role;
      // Persist updated user with role locally
      await saveToken(tokenData?.token || '', { ...freshUser, role: freshRole });
      role = freshRole;
    }
  } catch (_) {
    // Ignore network errors; fall back to locally stored role
  }

  return role ? String(role).toLowerCase() : null;
};

export const getCurrentUser = async () => {
  const tokenData = await getToken();
  // Attempt to refresh user from backend so UI reflects latest role/profile
  try {
    const res = await API.get('/v1/user');
    const freshUser = res?.data?.data?.user || res?.data?.user || res?.data || null;
    if (freshUser) {
      const freshRole = freshUser.role || freshUser.roles?.[0] || tokenData?.user?.role || null;
      await saveToken(tokenData?.token || '', { ...freshUser, role: freshRole });
      return { ...freshUser, role: freshRole };
    }
  } catch (_) {
    // If API fails, return locally stored user
  }
  return tokenData?.user || null;
};

export const logout = async () => {
  try {
    // Clear local storage
    await clearAuthData();
    
    // Call logout API endpoint if needed
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error calling logout API:', error);
      // Continue with local logout even if API call fails
    }
    
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    return false;
  }
};