import { checkLogin, makeToken } from '@/lib/auth';
export async function POST(req) {
  const { user, pass } = await req.json();
  if (!checkLogin(user, pass)) return new Response('no', { status: 401 });
  const res = new Response('ok');
  res.headers.append('Set-Cookie', `session=${makeToken(user)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`);
  return res;
}
