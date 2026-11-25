import { supabase } from '../lib/supabase.js';

export async function apiFetch(input, init = {}) {
  const { data, error } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (error || !accessToken) {
    throw new Error('Please sign in to continue');
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);

  return fetch(input, { ...init, headers });
}
