import { NextRequest, NextResponse } from 'next/server';
import { upsertUserToSupabase } from '@/lib/auth0-upsert';

/**
 * ユーザー同期API: クライアントから送信されたユーザー情報をSupabaseに同期
 * POST /api/auth/sync-user
 */
export async function POST(request: Request) {
  try {
    // Auth0の /auth/profile エンドポイントから渡される完全なプロフィールデータを受け取る
    const profileData = await request.json();
    console.log('Received profile data:', profileData);

    const { 
      sub,
      email, 
      name,
      given_name,
      family_name,
      nickname,
      picture,
      email_verified 
    } = profileData;

    if (!sub) {
      return NextResponse.json(
        { success: false, error: 'Missing required sub field' },
        { status: 400 }
      );
    }

    // 汎用的なemailフォールバック（全OAuthプロバイダー対応）
    let userEmail = email;
    if (!userEmail) {
      // プロバイダー別のフォールバックemail生成
      if (sub.startsWith('facebook|')) {
        const userId = sub.replace('facebook|', '');
        userEmail = `${userId}@facebook.oauth`;
      } else if (sub.startsWith('apple|')) {
        const userId = sub.replace('apple|', '');
        userEmail = `${userId}@apple.oauth`;
      } else if (sub.startsWith('microsoft|')) {
        const userId = sub.replace('microsoft|', '');
        userEmail = `${userId}@microsoft.oauth`;
      } else if (sub.startsWith('auth0|')) {
        // 通常のAuth0メール認証の場合、実際のemailがあるはず
        const userId = sub.replace('auth0|', '');
        userEmail = `${userId}@auth0.local`;
      } else {
        // その他のプロバイダー（Twitter, LinkedIn等）
        const providerMatch = sub.match(/^([^|]+)\|(.+)$/);
        if (providerMatch) {
          const [, provider, userId] = providerMatch;
          userEmail = `${userId}@${provider}.oauth`;
        } else {
          // フォールバック
          userEmail = `${sub}@unknown.oauth`;
        }
      }
      console.log('Generated fallback email:', userEmail);
    }

    // 汎用的な表示名の決定（優先順位: name > nickname > "given_name family_name" > subから生成）
    let displayName = '';
    
    // 1. name フィールド（最優先）
    if (name && name.trim()) {
      displayName = name.trim();
    }
    // 2. nickname フィールド
    else if (nickname && nickname.trim()) {
      displayName = nickname.trim();
    }
    // 3. given_name + family_name の組み合わせ
    else if (given_name && family_name) {
      displayName = `${family_name.trim()} ${given_name.trim()}`.trim();
    }
    // 4. given_name のみ
    else if (given_name && given_name.trim()) {
      displayName = given_name.trim();
    }
    // 5. family_name のみ
    else if (family_name && family_name.trim()) {
      displayName = family_name.trim();
    }
    // 6. subから生成（最終フォールバック）
    else {
      if (sub.startsWith('facebook|')) {
        displayName = 'Facebookユーザー';
      } else if (sub.startsWith('google-oauth2|')) {
        displayName = 'Googleユーザー';
      } else if (sub.startsWith('apple|')) {
        displayName = 'Appleユーザー';
      } else if (sub.startsWith('microsoft|')) {
        displayName = 'Microsoftユーザー';
      } else if (sub.startsWith('auth0|')) {
        displayName = 'ユーザー';
      } else {
        const providerMatch = sub.match(/^([^|]+)\|/);
        const provider = providerMatch ? providerMatch[1] : 'Unknown';
        displayName = `${provider}ユーザー`;
      }
    }

    await upsertUserToSupabase(sub, userEmail, displayName, picture);

    return NextResponse.json({ 
      success: true, 
      message: 'User synced successfully',
      userData: {
        sub,
        email: userEmail,
        displayName,
        picture,
        emailVerified: email_verified
      }
    });
  } catch (error) {
    console.error('Sync user API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
