import { useState, type FormEvent } from 'react';
import { Button, Card, ErrorText, Field, LinkButton } from '../../shared/layout/Card';
import { messageFor, post, type Account } from '../../shared/tools-client/api';
import { CodeStep, SetPasswordStep } from './steps';

type Mode = 'view' | 'change' | 'code' | 'new_password';

export function AccountPage({ account, onChanged, onLeave }: {
  account: Account;
  onChanged: (account: Account) => void;
  onLeave: () => void;
}) {
  const [mode, setMode] = useState<Mode>('view');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [ticket, setTicket] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  function done(updated: Account, message: string) {
    onChanged(updated);
    setMode('view');
    setOldPassword('');
    setNewPassword('');
    setError('');
    setNotice(message);
  }

  async function sendCode() {
    setError('');
    setNotice('');
    try {
      await post('/api/auth/code/send', { email: account.email });
      setMode('code');
    } catch (failure) {
      setError(messageFor(failure));
    }
  }

  async function change(event: FormEvent) {
    event.preventDefault();
    if (newPassword.length < 8) return setError('The new password needs at least 8 characters.');
    setBusy(true);
    setError('');
    try {
      const result = await post<{ account: Account }>('/api/auth/password/change', {
        email: account.email,
        old_password: oldPassword,
        new_password: newPassword,
      });
      done(result.account, 'Your password was changed.');
    } catch (failure) {
      setError(messageFor(failure));
    } finally {
      setBusy(false);
    }
  }

  if (mode === 'code') {
    return (
      <Card title="Confirm it's you" subtitle="Enter the code we sent to your email.">
        <CodeStep email={account.email} onVerified={(result) => { setTicket(result.ticket); setMode('new_password'); }} />
        <div className="text-center"><LinkButton onClick={() => setMode('view')}>Cancel</LinkButton></div>
      </Card>
    );
  }

  if (mode === 'new_password') {
    return (
      <Card title={account.has_password ? 'New password' : 'Set a password'}>
        <SetPasswordStep
          ticket={ticket}
          label="New password"
          onDone={(updated) => done(updated, account.has_password ? 'Your password was changed.' : 'Your password was set.')}
        />
      </Card>
    );
  }

  if (mode === 'change') {
    return (
      <Card title="Change password" subtitle="First confirm it's you with your current password.">
        <form onSubmit={change} className="space-y-4">
          <Field label="Current password" type="password" value={oldPassword} onChange={setOldPassword} autoComplete="current-password" autoFocus />
          <Field label="New password" type="password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
          <ErrorText text={error} />
          <Button busy={busy}>Change password</Button>
        </form>
        <div className="flex justify-between">
          <LinkButton onClick={sendCode}>Use a code instead</LinkButton>
          <LinkButton onClick={() => { setMode('view'); setError(''); }}>Cancel</LinkButton>
        </div>
      </Card>
    );
  }

  const rows: [string, string][] = [
    ['Email', account.email],
    ['Name', account.name ?? 'Not set'],
    ['Phone', account.phone ?? 'Not set'],
    ['Language', account.language === 'ar' ? 'Arabic' : 'English'],
    ['Signs in with', [account.has_password && 'Password', account.has_google && 'Google'].filter(Boolean).join(' and ') || 'Email code'],
    ['Member since', new Date(account.created_at).toLocaleDateString()],
  ];

  return (
    <Card title="My account">
      <dl className="divide-y divide-slate-100 rounded-lg bg-slate-50">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-right font-medium text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
      {notice && <p className="text-sm text-emerald-700">{notice}</p>}
      <ErrorText text={error} />
      {account.has_password ? (
        <Button type="button" kind="secondary" onClick={() => { setNotice(''); setMode('change'); }}>Change password</Button>
      ) : (
        <Button type="button" kind="secondary" onClick={sendCode}>Set a password</Button>
      )}
      {!account.has_password && (
        <p className="text-xs text-slate-500">We'll email you a code first, to confirm it's you.</p>
      )}
      <div className="text-center">
        <LinkButton onClick={onLeave}>Leave</LinkButton>
      </div>
      <p className="text-center text-xs text-slate-400">Staying logged in comes in a later step; reloading the page brings you back to the start.</p>
    </Card>
  );
}
