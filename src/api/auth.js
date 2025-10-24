import API from './axiosConfig';
import { setAuthData } from '../utils/auth';

export const login = (credentials) => {
  return API.post('/v1/login', credentials);
};

export const register = (userData) => {
  return API.post('/v1/register', userData);
};

export const logout = () => {
  return API.post('/v1/logout');
};

export const getCurrentUser = () => {
  return API.get('/v1/user');
};

export const updateProfile = (payload) => {
  return API.put('/v1/user/profile', payload);
};

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
  };
  return API.post('/v1/user/avatar', formData, config);
};

export const changePassword = (current_password, password, password_confirmation) => {
  return API.put('/v1/user/password', {
    current_password,
    password,
    password_confirmation,
  });
};

export const sendForgotPasswordLink = (email) => {
  return API.post('/v1/forgot-password', { email });
};

export const googleLogin = async (idToken) => {
  const res = await API.post('/v1/login/google', { idToken });
  const { status, data } = res.data;
  if (status === 'success' && data?.user && data?.token) {
    await setAuthData(data.token, data.user, data.user.role);
  }
  return res.data;
};
