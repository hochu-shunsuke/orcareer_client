import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { jwtVerify } from "jose";

// --- Auth0設定（環境変数で管理するのが推奨） ---
const AUTH0_ISSUER = process.env.AUTH0_ISSUER!; // 例: "https://YOUR_DOMAIN/"
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE!;
const AUTH0_JWKS_URL = process.env.AUTH0_JWKS_URL!;

// --- Supabase設定 ---
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

async function verifyJwt(token: string) {
  // joseでJWKsから公開鍵取得＆検証
  const JWKS = await fetch(AUTH0_JWKS_URL).then(res => res.json());
  const { payload } = await jwtVerify(token, async (header, _token) => {
    const jwk = JWKS.keys.find((k: any) => k.kid === header.kid);
    if (!jwk) throw new Error("JWK not found");
    return await import('jose').then(jose => jose.importJWK(jwk));
  }, {
    issuer: AUTH0_ISSUER,
    audience: AUTH0_AUDIENCE,
  });
  return payload;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = auth.slice(7);

  // JWT検証
  let payload;
  try {
    payload = await verifyJwt(token);
  } catch (e) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // SupabaseクライアントをJWT認証で生成
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });


  // RLSでsub一致ユーザーのみ取得（sub=auth0のsub）
  let { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("sub", payload.sub)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116: No rows found
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ユーザーが存在しなければupsert
  if (!data) {
    const { error: upsertError } = await supabase
      .from("users")
      .upsert({ sub: payload.sub, email: payload.email })
      .select();
    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }
    // upsert後に再取得
    const { data: newData, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("sub", payload.sub)
      .single();
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    data = newData;
  }
  return NextResponse.json({ user: data });
}
