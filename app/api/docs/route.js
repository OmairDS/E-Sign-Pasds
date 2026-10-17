import crypto from 'crypto';
import { currentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
export async function POST(req) {
  const me = await currentAdmin();
  if (!me) return new Response('Unauthorized', { status: 401 });
  const fd = await req.formData();
  const file = fd.get('pdf');
  const fields = JSON.parse(fd.get('fields') || '[]');
  if (!file || !fields.length) return new Response('Missing pdf or fields', { status: 400 });
  const id = crypto.randomUUID();
  const b64 = Buffer.from(await file.arrayBuffer()).toString('base64');
  const sql = await db();
  await sql`INSERT INTO documents (id, title, pdf_b64, created_by) VALUES (${id}, ${fd.get('title') || 'Untitled'}, ${b64}, ${me})`;
  for (const f of fields) {
    await sql`INSERT INTO fields (doc_id, page, x, y, w, h, signer) VALUES (${id}, ${f.page}, ${f.x}, ${f.y}, ${f.w}, ${f.h}, ${f.signer})`;
  }
  return Response.json({ id });
}
