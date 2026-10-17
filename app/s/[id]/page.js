import { db } from '@/lib/db';
import SignClient from './SignClient';
export const dynamic = 'force-dynamic';
export default async function SignPage({ params }) {
  const { id } = await params;
  const sql = await db();
  const [d] = await sql`SELECT id, title FROM documents WHERE id = ${id}`;
  if (!d) return <main style={{ padding: 40 }}>Document not found.</main>;
  const fields = await sql`SELECT id, page, x, y, w, h, signer, (signature IS NOT NULL) AS signed FROM fields WHERE doc_id = ${id} ORDER BY id`;
  return <SignClient doc={d} fields={fields} />;
}
