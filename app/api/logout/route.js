export async function GET(req) {
  return new Response(null, { status: 302, headers: { Location: new URL('/login', req.url).toString(), 'Set-Cookie': 'session=; Path=/; Max-Age=0' } });
}
