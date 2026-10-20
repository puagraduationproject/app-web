import { useEffect, useState } from 'react';
import { Card } from '../shared/layout/Card';
import { get, post, type Account } from '../shared/tools-client/api';
import { LandingPage } from './LandingPage';
import { AccountPage } from './setup/AccountPage';
import { StartPage } from './setup/StartPage';
import { StatusPage } from './StatusPage';

function go(path: string) {
  history.pushState(null, '', path);
  dispatchEvent(new PopStateEvent('popstate'));
}

export function App() {
  const [path, setPath] = useState(location.pathname);
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const update = () => setPath(location.pathname);
    addEventListener('popstate', update);
    return () => removeEventListener('popstate', update);
  }, []);

  useEffect(() => {
    if (location.hash.startsWith('#ticket=')) {
      const ticket = location.hash.slice('#ticket='.length);
      history.replaceState(null, '', location.pathname);
      post<{ account: Account }>('/api/auth/ticket', { ticket })
        .then((result) => setAccount(result.account))
        .catch(() => go('/login?google=expired'))
        .finally(() => setLoading(false));
      return;
    }
    get<{ account: Account }>('/api/auth/me')
      .then((result) => setAccount(result.account))
      .catch(() => setAccount(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (path === '/account' && !account) go('/login');
    if ((path === '/' || path === '/login') && account) go('/account');
  }, [path, account, loading]);

  if (path === '/status') return <StatusPage />;

  if (loading) return <Card title="Loading…">{null}</Card>;

  if (path === '/account' && account) {
    return <AccountPage account={account} onChanged={setAccount} onLoggedOut={() => { setAccount(null); go('/'); }} />;
  }

  if (path === '/login' || path === '/account') {
    return <StartPage onSignedIn={(signedIn) => { setAccount(signedIn); go('/account'); }} />;
  }

  return <LandingPage />;
}
