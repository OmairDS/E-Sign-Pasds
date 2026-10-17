import { neon } from '@neondatabase/serverless';
let sql, ready;
export async function db() {
  if (!sql) sql = neon(process.env.DATABASE_URL);
  if (!ready) {
    ready = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS documents (
        id text PRIMARY KEY, title text NOT NULL, pdf_b64 text NOT NULL,
        created_by text, created_at timestamptz DEFAULT now())`;
      await sql`CREATE TABLE IF NOT EXISTS fields (
        id serial PRIMARY KEY, doc_id text NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        page int NOT NULL, x real NOT NULL, y real NOT NULL, w real NOT NULL, h real NOT NULL,
        signer text NOT NULL, signature text, signed_at timestamptz)`;
    })();
  }
  await ready;
  return sql;
}
