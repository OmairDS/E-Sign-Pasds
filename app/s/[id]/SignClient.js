'use client';
import { useRef, useState } from 'react';
import PdfPages from '@/components/PdfPages';
export default function SignClient({ doc, fields }) {
  const names = [...new Set(fields.map(f => f.signer))];
  const pending = names.filter(n => fields.some(f => f.signer === n && !f.signed));
  const [me, setMe] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const cv = useRef(null); const drawing = useRef(false);

  const pos = (e) => { const r = cv.current.getBoundingClientRect(); return [(e.clientX - r.left) * cv.current.width / r.width, (e.clientY - r.top) * cv.current.height / r.height]; };
  const start = (e) => { drawing.current = true; const c = cv.current.getContext('2d'); c.lineWidth = 3; c.lineCap = 'round'; c.strokeStyle = '#0b1f4d'; c.beginPath(); c.moveTo(...pos(e)); cv.current.setPointerCapture(e.pointerId); };
  const move = (e) => { if (!drawing.current) return; const c = cv.current.getContext('2d'); c.lineTo(...pos(e)); c.stroke(); setDrawn(true); };
  const end = () => { drawing.current = false; };
  const clear = () => { cv.current.getContext('2d').clearRect(0, 0, 600, 200); setDrawn(false); };
  async function submit() {
    setBusy(true);
    const r = await fetch('/api/sign', { method: 'POST', body: JSON.stringify({ docId: doc.id, signer: me, signature: cv.current.toDataURL('image/png') }) });
    setBusy(false);
    if (r.ok) setDone(true); else alert('Could not save — it may already be signed.');
  }
  if (done) return <main style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center' }}><h2>✅ Thank you, {me}.</h2><p>Your signature was recorded.</p></main>;
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h2>{doc.title}</h2>
      {!pending.length ? <p>✅ Everyone has signed this document.</p> : (
        <div style={{ background: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, display: 'grid', gap: 10 }}>
          <label><b>1. Select your name</b></label>
          <select value={me} onChange={e => { setMe(e.target.value); setTimeout(clear, 0); }} style={{ padding: 10, fontSize: 16 }}>
            <option value="">— choose —</option>
            {pending.map(n => <option key={n}>{n}</option>)}
          </select>
          {me && (<>
            <label><b>2. Draw your signature</b> (your box is highlighted in the document below)</label>
            <canvas ref={cv} width={600} height={200} onPointerDown={start} onPointerMove={move} onPointerUp={end}
              style={{ width: '100%', maxWidth: 600, border: '2px dashed #999', borderRadius: 8, background: '#fff', touchAction: 'none' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={clear} style={{ padding: '8px 14px' }}>Clear</button>
              <button onClick={submit} disabled={!drawn || busy} style={{ padding: '8px 14px', background: '#0f766e', color: '#fff', border: 0, borderRadius: 8, opacity: drawn ? 1 : .5 }}>{busy ? 'Saving…' : 'Sign & submit'}</button>
            </div>
          </>)}
        </div>
      )}
      <PdfPages url={`/api/docs/${doc.id}/pdf`} overlay={(n) => fields.filter(f => f.page === n).map(f => {
        const mine = f.signer === me && !f.signed;
        return (
          <div key={f.id} style={{ position: 'absolute', left: f.x * 100 + '%', top: f.y * 100 + '%', width: f.w * 100 + '%', height: f.h * 100 + '%',
            border: `2px ${f.signed ? 'solid #16a34a' : mine ? 'solid #f59e0b' : 'dashed #94a3b8'}`, background: f.signed ? '#16a34a22' : mine ? '#f59e0b33' : '#94a3b811',
            fontSize: 11, color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {f.signed ? '✓ signed' : f.signer}
          </div>);
      })} />
    </main>
  );
}
