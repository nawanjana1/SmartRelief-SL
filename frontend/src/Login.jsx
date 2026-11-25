import { useState } from 'react';
import { supabase } from './lib/supabase.js';

export default function Login() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'reset') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: window.location.origin },
        );

        if (resetError) throw resetError;
        setMessage('If an account exists for that email, a password reset link has been sent.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError('Sign in failed. Check your email and password.');
        }
      }
    } catch {
      setError(
        mode === 'reset'
          ? 'Could not send the reset email. Check the email and Supabase redirect URL settings.'
          : 'Sign in failed. Check your email and password.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-lg"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            SmartRelief SL
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {mode === 'reset' ? 'Reset password' : 'Sign in'}
          </h1>
          <p className="mt-2 text-slate-600">
            {mode === 'reset'
              ? 'Enter your school account email and we’ll send a reset link.'
              : 'Sign in with your school account.'}
          </p>
        </div>

        <label className="block space-y-2 font-medium text-slate-700">
          Email
          <input
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        {mode === 'signin' && (
          <label className="block space-y-2 font-medium text-slate-700">
            Password
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
        )}
        {message && (
          <p className="rounded-lg bg-green-50 p-4 text-green-700">{message}</p>
        )}

        <button
          className="w-full rounded-lg bg-sky-700 px-5 py-3 font-semibold text-white disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading
            ? mode === 'reset' ? 'Sending link...' : 'Signing in...'
            : mode === 'reset' ? 'Send reset link' : 'Sign in'}
        </button>

        <button
          className="w-full text-sm font-semibold text-sky-700 hover:underline"
          type="button"
          onClick={() => {
            setMode(mode === 'reset' ? 'signin' : 'reset');
            setError('');
            setMessage('');
          }}
        >
          {mode === 'reset' ? 'Back to sign in' : 'Forgot password?'}
        </button>
      </form>
    </main>
  );
}
