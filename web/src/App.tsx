import React, { useMemo, useState } from 'react';
const apiBase = import.meta.env.VITE_API_BASE_URL || '';
export default function App() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<unknown>(null);
  const disabled = useMemo(() => loading || !/^[a-z0-9-_]{1,100}$/i.test(name), [loading, name]);
  async function createRepo(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setOut(null);
    try {
      const url = ${apiBase.replace(/\/+$/,'')}/create?name=;
      const res = await fetch(url, { method: 'POST' });
      const json = await res.json().catch(() => ({}));
      setOut(json);
    } catch (err) { setOut({ success: false, error: String(err) }); }
    finally { setLoading(false); }
  }
  return (
    <div style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'ui-sans-serif, system-ui', padding: 16 }}>
      <h1>F25 Repo Creator</h1>
      {!apiBase && <p style={{ color: 'crimson' }}>VITE_API_BASE_URL is not set.</p>}
      <form onSubmit={createRepo} style={{ display: 'grid', gap: 12 }}>
        <label>
          Repository name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="my-new-repo" style={{ width: '100%', padding: 8, fontSize: 16 }} />
        </label>
        <button disabled={disabled} type="submit" style={{ padding: '10px 16px', fontSize: 16 }}>
          {loading ? 'Creating…' : 'Create Repository'}
        </button>
      </form>
      <div style={{ marginTop: 24 }}>
        <h2>Result</h2>
        <pre style={{ background: '#f6f8fa', padding: 12, borderRadius: 6, overflow: 'auto' }}>
          {out ? JSON.stringify(out, null, 2) : '—'}
        </pre>
      </div>
    </div>
  );
}
