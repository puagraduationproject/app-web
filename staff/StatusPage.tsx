import { useEffect, useState } from 'react';

type Part = 'up' | 'down' | 'checking';

type Health = { backend: Part; database: Part; time?: string };

export function StatusPage() {
  const [health, setHealth] = useState<Health>({ backend: 'checking', database: 'checking' });

  useEffect(() => {
    fetch('/api/health')
      .then((response) => response.json())
      .then((body) => setHealth({ backend: body.backend, database: body.database, time: body.time }))
      .catch(() => setHealth({ backend: 'down', database: 'down' }));
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">EdaraPilot</h1>
        <p className="mt-2 text-slate-500">One AI for every small business.</p>
        <ul className="mt-6 space-y-2">
          <Status label="Web" value="up" />
          <Status label="Backend" value={health.backend} />
          <Status label="Database" value={health.database} />
        </ul>
        {health.time && <p className="mt-6 text-xs text-slate-400">Checked {health.time}</p>}
      </div>
    </main>
  );
}

function Status({ label, value }: { label: string; value: Part }) {
  const colour =
    value === 'up' ? 'bg-emerald-500' : value === 'down' ? 'bg-rose-500' : 'bg-amber-400';
  return (
    <li className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2">
      <span className="text-slate-700">{label}</span>
      <span className="flex items-center gap-2 text-sm text-slate-600">
        <span className={`h-2.5 w-2.5 rounded-full ${colour}`} />
        {value}
      </span>
    </li>
  );
}
