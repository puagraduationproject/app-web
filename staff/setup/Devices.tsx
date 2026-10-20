import { useEffect, useState } from 'react';
import { ErrorText, LinkButton } from '../../shared/layout/Card';
import { get, messageFor, post, type Session } from '../../shared/tools-client/api';

export function Devices() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setSessions((await get<{ sessions: Session[] }>('/api/auth/sessions')).sessions);
    } catch (failure) {
      setError(messageFor(failure));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function end(path: string, body?: object) {
    setError('');
    try {
      await post(path, body);
      await load();
    } catch (failure) {
      setError(messageFor(failure));
    }
  }

  const others = sessions.filter((session) => !session.current).length;

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-slate-900">Devices logged in</h2>
      <ul className="divide-y divide-slate-100 rounded-lg bg-slate-50">
        {sessions.map((session) => (
          <li key={session.id} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
            <div>
              <p className="font-medium text-slate-900">{session.browser}{session.current && ' (this device)'}</p>
              <p className="text-xs text-slate-500">
                Last used {new Date(session.last_seen_at).toLocaleString()} · {session.ip}
              </p>
            </div>
            {!session.current && (
              <LinkButton onClick={() => end('/api/auth/sessions/end', { id: session.id })}>Log out</LinkButton>
            )}
          </li>
        ))}
      </ul>
      {others > 0 && (
        <div className="text-center">
          <LinkButton onClick={() => end('/api/auth/sessions/end-others')}>Log out of all other devices</LinkButton>
        </div>
      )}
      <ErrorText text={error} />
    </section>
  );
}
