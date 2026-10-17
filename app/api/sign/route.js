import { db } from '@/lib/db';
export async function POST(req) {
  const { docId, signer, signature } = await req.json();
  if (!docId || !signer || !String(signature).startsWith('data:image/png;base64,') || signature.length > 400000)
    return new Response('Bad request', { status: 400 });
  const sql = await db();
  const rows = await sql`UPDATE fields SET signature = ${signature}, signed_at = now()
    WHERE doc_id = ${docId} AND signer = ${signer} AND signature IS NULL RETURNING id`;
  if (!rows.length) return new Response('Already signed or not found', { status: 409 });
  return Response.json({ ok: true });
}
