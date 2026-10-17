'use client';
import { useState } from 'react';
import PdfPages from '@/components/PdfPages';
export default function NewDoc() {
  const [file, setFile] = useState(null);
  const [buf, setBuf] = useState(null);
  const [title, setTitle] = useState('');
  const [signer, setSigner] = useState('');
  const [fields, setFields] = useState([]);
  const [drag, setDrag] = useState(null);
  const [busy, setBusy] = useState(false);

  async function pick(e) {
    const f = e.target.files[0]; if (!f) return;
    setFile(f); setTitle(t => t || f.name.replace(/\.pdf$/i, ''));
    setBuf(await f.arrayBuffer()); setFields([]);
  }
  const frac = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) };
  };
  function down(page, e) {
    if (!signer.trim()) { alert('Type the signer name first (top bar), then drag a box.'); return; }
    setDrag({ page, ...frac(e), x2: 0, y2: 0, active: true }); setDrag(d => ({ ...d, x2: d.x, y2: d.y }));
  }
  function move(e) { if (drag?.active) { const p = frac(e); setDrag({ ...drag, x2: p.x, y2: p.y }); } }
  function up() {
    if (!drag?.active) return;
    const x = Math.min(drag.x, drag.x2), y = Math.min(drag.y, drag.y2);
    const w = Math.abs(drag.x2 - drag.x), h = Math.abs(drag.y2 - drag.y);
    if (w > 0.02 && h > 0.01) setFields(f => [...f, { page: drag.page, x, y, w, h, signer: signer.trim() }]);
    setDrag(null);
  }
  async function save() {
    if (!fields.length) return alert('Place at least one signature box.');
    setBusy(true);
    const fd = new FormData(); fd.append('pdf', file); fd.append('title', title); fd.append('fields', JSON.stringify(fields));
    const r = await fetch('/api/docs', { method: 'POST', body: fd });
    setBusy(false);
    if (r.ok) location.href = '/admin'; else alert('Save failed: ' + (await r.text()));
  }
  const names = [...new Set(fields.map(f => f.signer))];
  return (
    <main style={{ maxWidth: 900, margin: '20px auto', padding: 16 }}>
      <a href="/admin">← Back</a>
      <h1>New document</h1>
      <input type="file" accept="application/pdf" onChange={pick} />
      {buf && (
        <>
          <div style={{ position: 'sticky', top: 0, background: '#f4f6f8', padding: '10px 0', zIndex: 5, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" style={{ padding: 8 }} />
            <input value={signer} onChange={e => setSigner(e.target.value)} placeholder="Signer name for next box" style={{ padding: 8 }} list="names" />
            <datalist id="names">{names.map(n => <option key={n} value={n} />)}</datalist>
            <span style={{ fontSize: 13 }}>Then drag on the page to draw the signature box. {fields.length} box(es), {names.length} signer(s).</span>
            <button onClick={save} disabled={busy} style={{ padding: '8px 14px', background: '#0f766e', color: '#fff', border: 0, borderRadius: 8 }}>{busy ? 'Saving…' : 'Save document'}</button>
          </div>
          <PdfPages url={buf} overlay={(n) => (
            <div style={{ position: 'absolute', inset: 0, cursor: 'crosshair', touchAction: 'none' }}
              onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); down(n, e); }} onPointerMove={move} onPointerUp={up}>
              {fields.map((f, i) => f.page === n && (
                <div key={i} style={box(f, '#0f766e')}>
                  <span style={{ fontSize: 11 }}>{f.signer}</span>
                  <button onPointerDown={e => e.stopPropagation()} onClick={() => setFields(fs => fs.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -10, right: -10, borderRadius: 10, border: 0, background: 'crimson', color: '#fff', width: 20, height: 20 }}>×</button>
                </div>
              ))}
              {drag?.active && drag.page === n && <div style={box({ x: Math.min(drag.x, drag.x2), y: Math.min(drag.y, drag.y2), w: Math.abs(drag.x2 - drag.x), h: Math.abs(drag.y2 - drag.y) }, '#f59e0b')} />}
            </div>
          )} />
        </>
      )}
    </main>
  );
}
const box = (f, c) => ({ position: 'absolute', left: f.x * 100 + '%', top: f.y * 100 + '%', width: f.w * 100 + '%', height: f.h * 100 + '%', border: `2px dashed ${c}`, background: c + '22', color: c });
