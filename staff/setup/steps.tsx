import { useEffect, useState, type FormEvent } from 'react';
import { Button, ErrorText, Field, LinkButton } from '../../shared/layout/Card';
import { messageFor, post, type Account } from '../../shared/tools-client/api';

export type Verified = { ticket: string; needs_password: boolean; account: Account };

export function CodeStep({ email, onVerified, waitSeconds = 60 }: {
  email: string;
  onVerified: (result: Verified) => void;
  waitSeconds?: number;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(waitSeconds);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      onVerified(await post<Verified>('/api/auth/code/verify', { email, code }));
    } catch (failure) {
      setError(messageFor(failure));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError('');
    setNotice('');
    try {
      const result = await post<{ retry_after_seconds: number }>('/api/auth/code/send', { email });
      setWait(result.retry_after_seconds);
      setNotice('A new code is on its way.');
    } catch (failure) {
      setError(messageFor(failure));
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-slate-600">
        We sent a 6-digit code to <span className="font-medium text-slate-900">{email}</span>. It works for 10 minutes.
      </p>
      <Field
        label="Code"
        value={code}
        onChange={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        autoFocus
      />
      <ErrorText text={error} />
      {notice && <p className="text-sm text-emerald-700">{notice}</p>}
      <Button busy={busy}>Continue</Button>
      <div className="text-center">
        <LinkButton onClick={resend} disabled={wait > 0}>
          {wait > 0 ? `Send a new code in ${wait}s` : 'Send a new code'}
        </LinkButton>
      </div>
      <p className="text-center text-xs text-slate-400">Can't find it? Check your spam folder.</p>
    </form>
  );
}

export function SetPasswordStep({ ticket, onDone, label = 'Set your password' }: {
  ticket: string;
  onDone: (account: Account) => void;
  label?: string;
}) {
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) return setError('The password needs at least 8 characters.');
    if (password !== again) return setError("The two passwords don't match.");
    setBusy(true);
    setError('');
    try {
      onDone((await post<{ account: Account }>('/api/auth/password/set', { ticket, password })).account);
    } catch (failure) {
      setError(messageFor(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label={label} type="password" value={password} onChange={setPassword} autoComplete="new-password" autoFocus />
      <Field label="The same password again" type="password" value={again} onChange={setAgain} autoComplete="new-password" />
      <p className="text-xs text-slate-500">At least 8 characters.</p>
      <ErrorText text={error} />
      <Button busy={busy}>Save password</Button>
    </form>
  );
}
