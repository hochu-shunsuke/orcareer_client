import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server environment');
}

export const supabaseServerClient: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    global: { headers: { 'x-orcareer-server': '1' } },
  }
);

export function createServerSupabaseClient(): SupabaseClient {
  return supabaseServerClient;
}

/**
 * Lightweight helper: select user id by auth0 sub
 * Returns { data, error } from supabase-js
 */
export async function selectUserIdByAuth0Sub(auth0Sub: string) {
  return supabaseServerClient
    .from('users')
    .select('id')
    .eq('auth0_user_id', auth0Sub)
    .limit(1)
    .maybeSingle();
}

/**
 * NanoID-like generator (base62) for public_id. No external dependency.
 * Uses crypto.randomInt for uniform distribution without bias.
 */
export function generatePublicId(size = 10): string {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let id = '';
  for (let i = 0; i < size; i++) {
    id += alphabet[crypto.randomInt(alphabet.length)];
  }
  return id;
}
