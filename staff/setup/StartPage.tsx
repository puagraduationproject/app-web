import { useState, type FormEvent } from 'react';
import { Button, ButtonLink, Card, ErrorText, Field, LinkButton } from '../../shared/layout/Card';
import { messageFor, post, type Account } from '../../shared/tools-client/api';
import { CodeStep, SetPasswordStep, type Verified } from './steps';

type Step = 'email' | 'code' | 'password' | 'google' | 'set_password';

const googleMessages: Record<string, string> = {
  not_ready: 'Google sign-in is not ready yet. Use your email for now.',
  cancelled: 'Google sign-in was cancelled.',
  expired: 'Google sign-in took too long. Please try again.',
  failed: "We couldn't sign you in with Google. Please try again.",
};

export function StartPage({ onSignedIn }: { onSignedIn: (account: Account) => void }) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ticket, setTicket] = useState('');
  const [error, setError] = useState(() => googleMessages[new URLSearchParams(location.search).get('google') ?? ''] ?? '');
  const [busy, setBusy] = useState(false);

  async function start(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await post<{ next: Step }>('/api/auth/start', { email });
      setStep(result.next);
    } catch (failure) {
      setError(messageFor(failure));
    } finally {
      setBusy(false);
    }
  }

  async function logIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      onSignedIn((await post<{ account: Account }>('/api/auth/password/login', { email, password })).account);
    } catch (failure) {
      setError(messageFor(failure));
    } finally {
      setBusy(false);
    }
  }

  async function codeInstead() {
    setError('');
    try {
      await post('/api/auth/code/send', { email });
      setStep('code');
    } catch (failure) {
      setError(messageFor(failure));
    }
  }

  function verified(result: Verified) {
    if (result.needs_password) {
      setTicket(result.ticket);
      setStep('set_password');
    } else {
      onSignedIn(result.account);
    }
  }

  const back = (
    <div className="text-center">
      <LinkButton onClick={() => { setStep('email'); setError(''); setPassword(''); }}>Use another email</LinkButton>
    </div>
  );

  if (step === 'code') {
    return (
      <Card title="Check your email">
        <CodeStep email={email} onVerified={verified} />
        {back}
      </Card>
    );
  }

  if (step === 'set_password') {
    return (
      <Card title="Set a password" subtitle="You'll use it to log in next time.">
        <SetPasswordStep ticket={ticket} onDone={onSignedIn} />
      </Card>
    );
  }

  if (step === 'password') {
    return (
      <Card title="Welcome back" subtitle={email}>
        <form onSubmit={logIn} className="space-y-4">
          <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" autoFocus />
          <ErrorText text={error} />
          <Button busy={busy}>Log in</Button>
        </form>
        <div className="text-center">
          <LinkButton onClick={codeInstead}>Email me a code instead</LinkButton>
        </div>
        {back}
      </Card>
    );
  }

  if (step === 'google') {
    return (
      <Card title="Welcome back" subtitle={`${email} signs in with Google.`}>
        <ButtonLink href="/api/auth/google/start">
          <GoogleMark /> Continue with Google
        </ButtonLink>
        <ErrorText text={error} />
        <div className="text-center">
          <LinkButton onClick={codeInstead}>Email me a code instead</LinkButton>
        </div>
        {back}
      </Card>
    );
  }

  return (
    <Card title="Sign up or log in" subtitle="Start running your business in one place.">
      <ButtonLink href="/api/auth/google/start" kind="secondary">
        <GoogleMark /> Continue with Google
      </ButtonLink>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
      </div>
      <form onSubmit={start} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" inputMode="email" />
        <ErrorText text={error} />
        <Button busy={busy}>Continue with email</Button>
      </form>
    </Card>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
