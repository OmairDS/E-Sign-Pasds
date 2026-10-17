import { db } from '@/lib/db';
// Original (unsigned) PDF — needed by the public signing page.
export async function GET(_req, { params }) {
  const { id } = await params;
  const sql = await db();
  const [d] = await sql`SELECT pdf_b64 FROM documents WHERE id = ${id}`;
  if (!d) return new Response('Not found', { status: 404 });
  return new Response(Buffer.from(d.pdf_b64, 'base64'), { headers: { 'Content-Type': 'application/pdf', 'Cache-Control': 'private, max-age=60' } });
}
