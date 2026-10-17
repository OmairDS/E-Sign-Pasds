'use client';
import { useState } from 'react';
export default function Login() {
  const [err, setErr] = useState('');
  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const r = await fetch('/api/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(f)) });
    if (r.ok) location.href = '/admin'; else setErr('Wrong username or password');
  }
  return (
    <form onSubmit={submit} style={{ maxWidth: 320, margin: '80px auto', background: '#fff', padding: 24, borderRadius: 12, display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0 }}>Admin login</h2>
      <input name="user" placeholder="Username" required style={{ padding: 10 }} />
      <input name="pass" type="password" placeholder="Password" required style={{ padding: 10 }} />
      <button style={{ padding: 10, background: '#0f766e', color: '#fff', border: 0, borderRadius: 8 }}>Log in</button>
      {err && <div style={{ color: 'crimson' }}>{err}</div>}
    </form>
  );
}
