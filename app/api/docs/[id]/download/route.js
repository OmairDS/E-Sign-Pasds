import { PDFDocument } from 'pdf-lib';
import { currentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
export async function GET(_req, { params }) {
  if (!(await currentAdmin())) return new Response('Unauthorized', { status: 401 });
  const { id } = await params;
  const sql = await db();
  const [d] = await sql`SELECT title, pdf_b64 FROM documents WHERE id = ${id}`;
  if (!d) return new Response('Not found', { status: 404 });
  const fields = await sql`SELECT * FROM fields WHERE doc_id = ${id} AND signature IS NOT NULL`;
  const pdf = await PDFDocument.load(Buffer.from(d.pdf_b64, 'base64'));
  const pages = pdf.getPages();
  for (const f of fields) {
    const page = pages[f.page - 1]; if (!page) continue;
    const { width, height } = page.getSize();
    const img = await pdf.embedPng(Buffer.from(f.signature.split(',')[1], 'base64'));
    const bw = f.w * width, bh = f.h * height;
    const s = Math.min(bw / img.width, bh / img.height);
    page.drawImage(img, { x: f.x * width + (bw - img.width * s) / 2, y: height - (f.y + f.h) * height + (bh - img.height * s) / 2, width: img.width * s, height: img.height * s });
  }
  const out = await pdf.save();
  return new Response(out, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${d.title.replace(/[^\w\- ]/g, '_')}-signed.pdf"` } });
}
