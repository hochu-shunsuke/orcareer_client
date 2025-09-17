import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { supabaseServerClient } from "@/lib/supabase-server";

export const GET = async () => {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { sub, email, name } = session.user;
  // Supabase usersテーブルにupsert
  const { error } = await supabaseServerClient
    .from("users")
    .upsert({ id: sub, email, name });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
};

