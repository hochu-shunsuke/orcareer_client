import { auth0 } from '@/lib/auth0';

export async function GET(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  // v4系は session.tokenSet.accessToken に格納される
  const accessToken = session.accessToken || session.tokenSet?.accessToken;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'No accessToken in session', session }), { status: 400 });
  }
  return new Response(JSON.stringify({ accessToken }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
