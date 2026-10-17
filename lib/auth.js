import crypto from 'crypto';
import { cookies } from 'next/headers';
const secret = () => process.env.SESSION_SECRET || 'dev-secret';
const sign = (v) => crypto.createHmac('sha256', secret()).update(v).digest('hex');
export function checkLogin(user, pass) {
  const list = (process.env.ADMIN_USERS || '').split(',').map((s) => s.trim()).filter(Boolean);
  return list.some((p) => {
    const i = p.indexOf(':');
    return p.slice(0, i).toLowerCase() === String(user).toLowerCase() && p.slice(i + 1) === pass;
  });
}
export function makeToken(user) {
  const v = user.toLowerCase();
  return `${v}.${sign(v)}`;
}
export async function currentAdmin() {
  const c = (await cookies()).get('session')?.value;
  if (!c) return null;
  const i = c.lastIndexOf('.');
  const v = c.slice(0, i), s = c.slice(i + 1);
  const ok = s.length === 64 && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(sign(v)));
  return ok ? v : null;
}
