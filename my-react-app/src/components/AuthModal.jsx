import { useState } from 'react';

export default function AuthModal({ open, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/signin';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, deviceInfo: { deviceId: 'web', userAgent: navigator.userAgent } })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('focusflow_auth_token', data.token);
        onAuthSuccess && onAuthSuccess(data.user, data.token);
        onClose();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <h2 className="text-2xl font-bold mb-6">{mode === 'signup' ? 'Create Account' : 'Sign In'}</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            className="w-full p-3 border rounded-lg"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full p-3 border rounded-lg"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition"
            disabled={loading}
          >
            {loading ? (mode === 'signup' ? 'Signing Up...' : 'Signing In...') : (mode === 'signup' ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        <div className="my-4 text-gray-500 text-sm">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
          <button
            className="ml-2 text-blue-600 hover:underline"
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
          >
            {mode === 'signup' ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
        <button className="mt-2 text-gray-400 hover:text-gray-600 text-sm" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
} 