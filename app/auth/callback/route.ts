import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: NextRequest) {
  // Auth0セッション取得
  const session = await auth0.getSession();
  if (!session) {
    console.error('[auth/callback] Auth0セッションが取得できません');
    return NextResponse.redirect('/auth/login');
  }
  const { sub, email } = session.user;
  if (!sub || !email) {
    console.error('[auth/callback] subまたはemailが取得できません', session.user);
    return NextResponse.redirect('/auth/login');
  }
  // Supabase upsert
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { error } = await supabase.from('users').upsert({ sub, email });
  if (error) {
    console.error('[auth/callback] Supabase upsertエラー', error);
    return NextResponse.redirect('/auth/login?error=supabase_upsert');
  }
  // 認証後のリダイレクト先へ
  return NextResponse.redirect('/');
}
