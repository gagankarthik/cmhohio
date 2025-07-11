'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthPage() {
  const router = useRouter();

  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!email || (!password && view !== 'forgot')) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }

    try {
      if (view === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        // Insert profile
        if (data.user?.id) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email,
                organization_name: organization || null,
              },
            ]);
          if (insertError) throw insertError;
        }

        setMessage('Check your email to verify your account.');
        setView('login');
        setEmail('');
        setPassword('');
        setOrganization('');

      } else if (view === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        router.push('/events/new');

      } else if (view === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
        if (resetError) throw resetError;

        setMessage('Password reset email sent. Check your inbox.');
        setView('login');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow max-w-sm w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {view === 'signup'
            ? 'Create Account'
            : view === 'forgot'
            ? 'Forgot Password'
            : 'Welcome Back'}
        </h1>

        {message && (
          <div className="mb-4 text-green-600 text-sm text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          {view !== 'forgot' && (
            <input
              type="password"
              placeholder="Password"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          )}

          {view === 'signup' && (
            <input
              type="text"
              placeholder="Organization Name (optional)"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              value={organization}
              onChange={e => setOrganization(e.target.value)}
            />
          )}

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-neutral-900 text-white px-4 py-2 rounded hover:bg-neutral-800 transition"
          >
            {loading
              ? 'Loading...'
              : view === 'signup'
              ? 'Sign Up'
              : view === 'forgot'
              ? 'Send Reset Link'
              : 'Log In'}
          </button>
        </div>

        <div className="mt-4 text-sm text-center text-neutral-600 space-y-2">
          {view === 'login' && (
            <>
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setView('signup');
                    setError(null);
                    setMessage(null);
                  }}
                  className="underline hover:text-neutral-900"
                >
                  Sign Up
                </button>
              </p>
              <p>
                Forgot your password?{' '}
                <button
                  onClick={() => {
                    setView('forgot');
                    setError(null);
                    setMessage(null);
                  }}
                  className="underline hover:text-neutral-900"
                >
                  Reset
                </button>
              </p>
            </>
          )}

          {view === 'signup' && (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setView('login');
                  setError(null);
                  setMessage(null);
                }}
                className="underline hover:text-neutral-900"
              >
                Log In
              </button>
            </p>
          )}

          {view === 'forgot' && (
            <p>
              Remembered?{' '}
              <button
                onClick={() => {
                  setView('login');
                  setError(null);
                  setMessage(null);
                }}
                className="underline hover:text-neutral-900"
              >
                Back to Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
