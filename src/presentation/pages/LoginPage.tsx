import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import logo from '../../assets/logo.svg';

export const LoginPage = () => {
  const { signInWithGoogle, signIn, loading, error, user } = useAuthStore();
  const navigate = useNavigate();

  // Local state for email/password login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  // After OAuth redirect, sync Supabase session into our auth store
  useEffect(() => {
    const sync = async () => {
      await useAuthStore.getState().refreshSession();
      const { user } = useAuthStore.getState();
      if (user) {
        navigate('/');
        // Clear any leftover hash fragment from the OAuth callback
        window.location.hash = '';
      }
    };
    sync();
  }, [navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 text-white">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-sm flex flex-col items-center text-white">
        {/* App logo */}
        <img src={logo} alt="Reptor" className="w-24 h-24 mb-6" />

        {/* Email / password form */}
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-2 w-full mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-600 p-2 rounded w-full bg-gray-700 text-white placeholder-gray-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-600 p-2 rounded w-full bg-gray-700 text-white placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Divider */}
        <div className="text-gray-400 mb-4">or</div>

        {/* Google sign‑in button */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? 'Signing in…' : 'Sign in with Google'}
        </button>

        {/* Link to register */}
        <div className="mt-2 w-full text-center">
          <a href="/register" className="text-blue-400 underline">
            Create an account
          </a>
        </div>

        {error && (
          <pre className="mt-2 text-red-500 whitespace-pre-wrap break-all w-full">
            {JSON.stringify(error, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};