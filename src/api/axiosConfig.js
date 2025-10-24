import axios from 'axios';
import { getToken } from '../utils/tokenStorage';
import { getDeviceInfo } from '../utils/deviceInfo';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for sending cookies
});

// Interceptor for adding auth token and device info
API.interceptors.request.use(async (config) => {
  const tokenData = await getToken();
  if (tokenData?.token) {
    config.headers.Authorization = `Bearer ${tokenData.token}`;
  }
  
  // Add device information to every request
  const deviceInfo = getDeviceInfo();
  config.headers['X-Device-Fingerprint'] = deviceInfo.deviceFingerprint;
  config.headers['X-Device-Type'] = deviceInfo.deviceType;
  config.headers['X-Browser'] = deviceInfo.browser;
  config.headers['X-Platform'] = deviceInfo.platform;
  
  return config;
});

// Interceptor for handling 401 errors
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token one last time
      try {
        const tokenData = await getToken();
        if (tokenData?.token) {
          // Retry the original request
          const originalRequest = error.config;
          originalRequest.headers.Authorization = `Bearer ${tokenData.token}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
      }
      
      // If refresh failed, redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
