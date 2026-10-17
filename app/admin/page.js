import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { currentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
export const dynamic = 'force-dynamic';
export default async function Admin() {
  const me = await currentAdmin();
  if (!me) redirect('/login');
  const sql = await db();
  const docs = await sql`SELECT d.id, d.title, d.created_at,
    count(f.id)::int AS total, count(f.signature)::int AS signed
    FROM documents d LEFT JOIN fields f ON f.doc_id = d.id GROUP BY d.id ORDER BY d.created_at DESC`;
  const h = await headers();
  const origin = `https://${h.get('host')}`;
  return (
    <main style={{ maxWidth: 820, margin: '30px auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Documents</h1>
        <div><a href="/admin/new" style={btn}>+ New document</a> <a href="/api/logout" style={{ marginLeft: 12 }}>Log out ({me})</a></div>
      </div>
      {docs.length === 0 && <p>No documents yet.</p>}
      {docs.map((d) => {
        const done = d.total > 0 && d.signed === d.total;
        return (
          <div key={d.id} style={{ background: '#fff', padding: 16, borderRadius: 12, marginTop: 14 }}>
            <b>{d.title}</b> — {d.signed}/{d.total} signed {done && '✅'}
            <div style={{ marginTop: 8, fontSize: 14 }}>
              Sign link: <code>{origin}/s/{d.id}</code>
            </div>
            <div style={{ marginTop: 10 }}>
              <a href={`/api/docs/${d.id}/download`} style={btn}>{done ? 'Download signed PDF' : 'Download (partial)'}</a>
            </div>
          </div>
        );
      })}
    </main>
  );
}
const btn = { background: '#0f766e', color: '#fff', padding: '8px 14px', borderRadius: 8, textDecoration: 'none' };
