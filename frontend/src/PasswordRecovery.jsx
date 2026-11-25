import { useState } from 'react';
import { supabase } from './lib/supabase.js';

export default function PasswordRecovery({ onComplete }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage('Password updated. You can continue to the school portal.');
    } catch {
      setError('Could not update the password. The reset link may have expired; request a new one.');
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
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Choose a new password</h1>
          <p className="mt-2 text-slate-600">Set a new password for your school account.</p>
        </div>

        <label className="block space-y-2 font-medium text-slate-700">
          New password
          <input
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <label className="block space-y-2 font-medium text-slate-700">
          Confirm new password
          <input
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>

        {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
        {message && <p className="rounded-lg bg-green-50 p-4 text-green-700">{message}</p>}

        {message ? (
          <button
            className="w-full rounded-lg bg-sky-700 px-5 py-3 font-semibold text-white"
            type="button"
            onClick={onComplete}
          >
            Continue to portal
          </button>
        ) : (
          <button
            className="w-full rounded-lg bg-sky-700 px-5 py-3 font-semibold text-white disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Updating password...' : 'Update password'}
          </button>
        )}
      </form>
    </main>
  );
}
