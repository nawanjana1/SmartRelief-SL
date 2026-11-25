import { useState } from 'react';
import { supabase } from './lib/supabase.js';

export default function Settings({ email, onSignOut }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function handlePasswordChange(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 8) {
      setError('New password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInError) throw new Error('Current password is incorrect.');

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Password changed successfully.');
    } catch (changeError) {
      setError(changeError.message || 'Could not change the password.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="settings-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow heading-eyebrow">SCHOOL PORTAL</span>
          <h1>Settings</h1>
          <p>Manage your administrator account and sign-in security.</p>
        </div>
      </div>

      <article className="panel" style={{ padding: 24, marginBottom: 18 }}>
        <span className="eyebrow">ACCOUNT</span>
        <h2 style={{ margin: '8px 0 18px' }}>Administrator profile</h2>
        <div className="teacher-row">
          <span><strong>Email</strong></span>
          <span>{email}</span>
        </div>
        <div className="teacher-row">
          <span><strong>Role</strong></span>
          <span>School administrator</span>
        </div>
        <button className="button button-light" onClick={onSignOut} type="button">
          Sign out
        </button>
      </article>

      <article className="panel" style={{ padding: 24 }}>
        <span className="eyebrow">SECURITY</span>
        <h2 style={{ margin: '8px 0 18px' }}>Change password</h2>
        <form onSubmit={handlePasswordChange} className="grid-form">
          <label>
            Current password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </label>
          <label>
            New password
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </label>
          <label>
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-success">{message}</p>}
          <button className="button button-primary" disabled={saving} type="submit">
            {saving ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </article>
    </section>
  );
}
