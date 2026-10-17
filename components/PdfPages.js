'use client';
import { useEffect, useState } from 'react';
const V = '4.10.38';
const BASE = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${V}/build/`;
// Renders every PDF page to a canvas; `overlay(pageNumber)` draws on top (positioned absolutely).
export default function PdfPages({ url, overlay, width = 800 }) {
  const [pages, setPages] = useState([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const pdfjs = await import(/* webpackIgnore: true */ BASE + 'pdf.min.mjs');
        pdfjs.GlobalWorkerOptions.workerSrc = BASE + 'pdf.worker.min.mjs';
        const buf = url instanceof ArrayBuffer ? url : await (await fetch(url)).arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: buf.slice(0) }).promise;
        const out = [];
        for (let n = 1; n <= pdf.numPages; n++) {
          const page = await pdf.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const vp = page.getViewport({ scale: (width / base.width) * 2 });
          const canvas = document.createElement('canvas');
          canvas.width = vp.width; canvas.height = vp.height;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
          out.push({ n, src: canvas.toDataURL('image/jpeg', 0.85), ratio: base.height / base.width });
          if (dead) return;
        }
        setPages(out);
      } catch (e) { setErr(String(e)); }
    })();
    return () => { dead = true; };
  }, [url, width]);
  if (err) return <div style={{ color: 'crimson' }}>Could not render PDF: {err}</div>;
  if (!pages.length) return <div>Loading PDF…</div>;
  return (
    <div style={{ display: 'grid', gap: 16, justifyContent: 'center' }}>
      {pages.map((p) => (
        <div key={p.n} style={{ position: 'relative', width: '100%', maxWidth: width, boxShadow: '0 2px 10px #0003', background: '#fff' }}>
          <img src={p.src} alt={`Page ${p.n}`} style={{ width: '100%', display: 'block' }} draggable={false} />
          <div style={{ position: 'absolute', inset: 0 }}>{overlay?.(p.n, p.ratio)}</div>
        </div>
      ))}
    </div>
  );
}
