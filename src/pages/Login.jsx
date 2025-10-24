import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { login, googleLogin } from '../api/auth';
import { setAuthData } from '../utils/auth';
import { logError } from '../utils/errorLogger';

export default function Login({ setIsAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              setLoading(true);
              setError(null);
              const result = await googleLogin(response.credential);
              if (result?.status === 'success') {
                // Debug: show Google login role and partial token in console
                try {
                  const tokenPreview = typeof result?.data?.token === 'string' ? `${result.data.token.slice(0, 12)}...` : '[no token]';
                  console.log('[Google Login Success]', {
                    user_id: result?.data?.user?.id,
                    role: result?.data?.user?.role,
                    token: tokenPreview,
                  });
                } catch (_) {}
                setIsAuth(true);
                navigate('/');
              } else {
                setError(result?.message || 'Google login failed');
              }
            } catch (err) {
              const errorDetails = logError(err, 'Google login');
              setError(errorDetails.message);
            } finally {
              setLoading(false);
            }
          },
        });
        const btn = document.getElementById('googleSignInBtn');
        if (btn) {
          window.google.accounts.id.renderButton(btn, { theme: 'outline', size: 'large' });
        }
        window.google.accounts.id.prompt();
      }
    };
    initGoogle();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await login({ email, password });
      // Backend sends { status, data: { user, token } } in response
      const { status, data } = res.data;
      if (status === 'success' && data.user && data.token) {
        // Debug: show user role and partial token in console
        try {
          const tokenPreview = typeof data.token === 'string' ? `${data.token.slice(0, 12)}...` : '[no token]';
          console.log('[Login Success]', { user_id: data.user.id, role: data.user.role, token: tokenPreview });
        } catch (_) {}
        await setAuthData(data.token, data.user, data.user.role);
        setIsAuth(true);
        navigate('/');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const errorDetails = logError(err, 'Login attempt');
      setError(errorDetails.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6">
          Login
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full"
          >
            {loading ? 'Loading...' : 'Login'}
          </Button>

          <div className="mt-4">
            <div id="googleSignInBtn" className="flex justify-center"></div>
          </div>

          <p className="text-center mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
