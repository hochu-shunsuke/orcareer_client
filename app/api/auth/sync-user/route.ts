import { NextRequest, NextResponse } from 'next/server';
import { upsertUserToSupabase } from '@/lib/auth0-upsert';

/**
 * ユーザー同期API: クライアントから送信されたユーザー情報をSupabaseに同期
 * POST /api/auth/sync-user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received user data:', body);
    
    const { sub, email, name, picture } = body;
    
    console.log('Extracted values:', { sub, email, name, picture });
    
    if (!sub) {
      console.log('Missing required data - sub:', !!sub);
      return NextResponse.json({
        error: 'Missing required user ID (sub)',
        received: { sub: !!sub, email: !!email, name: !!name, picture: !!picture }
      }, { status: 400 });
    }
    
    // emailがない場合のフォールバック処理
    let finalEmail = email;
    if (!finalEmail) {
      console.log('Email not provided by OAuth provider, using fallback');
      // プロバイダー名を取得 (例: "facebook|123" → "facebook")
      const provider = sub.split('|')[0] || 'oauth';
      const userId = sub.split('|')[1] || sub.replace(/[^a-zA-Z0-9]/g, '');
      finalEmail = `${provider}_${userId}@no-email.orcareer.local`;
    }
    
    await upsertUserToSupabase(sub, finalEmail, name, picture);
    
    return NextResponse.json({
      success: true,
      message: 'User synchronized successfully'
    });
  } catch (error) {
    console.error('User sync error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'User synchronization failed'
    }, { status: 500 });
  }
}
