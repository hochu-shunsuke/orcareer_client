import { NextRequest, NextResponse } from 'next/server';
import { syncCurrentUserToSupabase } from '../../../../lib/auth0-upsert';

/**
 * テスト用API: 現在のセッションからユーザー同期をテスト
 * GET /api/test/sync-user
 */
export async function GET(request: NextRequest) {
  try {
    await syncCurrentUserToSupabase();
    
    return NextResponse.json({
      ok: true,
      message: 'User sync completed'
    });
  } catch (error) {
    console.error('Sync test error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'User sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
