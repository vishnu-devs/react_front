// Token storage utility functions

export const saveToken = async (token, user) => {
  try {
    const tokenData = {
      token,
      user,
      timestamp: new Date().getTime()
    };
    localStorage.setItem('authToken', JSON.stringify(tokenData));
    return true;
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
};

export const getToken = async () => {
  try {
    const storedToken = localStorage.getItem('authToken');
    if (!storedToken) {
      return null;
    }

    const tokenData = JSON.parse(storedToken);
    const now = new Date().getTime();
    const tokenAge = now - tokenData.timestamp;
    const tokenValidityPeriod = 55 * 60 * 1000; // 55 minutes in milliseconds

    if (tokenAge > tokenValidityPeriod) {
      // Try to refresh token
      // Include device headers to satisfy backend verify.device middleware
      let headers = {};
      try {
        const { getDeviceInfo } = await import('./deviceInfo');
        const deviceInfo = getDeviceInfo();
        headers = {
          'X-Device-Fingerprint': deviceInfo.deviceFingerprint,
          'X-Device-Type': deviceInfo.deviceType,
          'X-Browser': deviceInfo.browser,
          'X-Platform': deviceInfo.platform,
        };
      } catch (_) {}

      const response = await fetch('/api/v1/refresh-token', {
        method: 'POST',
        credentials: 'include', // Important for sending cookies
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          // If backend returns updated user, use it; otherwise keep existing user
          const refreshedUser = (data?.data?.user) ? data.data.user : tokenData.user;
          const newTokenData = {
            token: data.data.token,
            user: refreshedUser,
            timestamp: new Date().getTime()
          };
          localStorage.setItem('authToken', JSON.stringify(newTokenData));
          return newTokenData;
        } else {
          removeToken();
          return null;
        }
      } else {
        removeToken();
        return null;
      }
    }

    return tokenData;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem('authToken');
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};