import { useEffect, useState } from 'react';
import { Card } from '../shared/layout/Card';
import { get, post, type Account, type Business } from '../shared/tools-client/api';
import { LandingPage } from './LandingPage';
import { AccountPage } from './setup/AccountPage';
import { SetupPage } from './setup/SetupPage';
import { StartPage } from './setup/StartPage';
import { StatusPage } from './StatusPage';
import { HomePage } from './home/HomePage';

const HOME = '/home';

function go(path: string) {
  history.pushState(null, '', path);
  dispatchEvent(new PopStateEvent('popstate'));
}

const loadBusinesses = () => get<{ businesses: Business[] }>('/api/app/businesses').then((result) => result.businesses);

export function App() {
  const [path, setPath] = useState(location.pathname);
  const [account, setAccount] = useState<Account | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const update = () => setPath(location.pathname);
    addEventListener('popstate', update);
    return () => removeEventListener('popstate', update);
  }, []);

  async function signedIn(signed: Account, firstVisit: boolean) {
    const mine = await loadBusinesses().catch(() => []);
    setBusinesses(mine);
    setAccount(signed);
    if (firstVisit) go(mine.length === 0 ? '/setup' : HOME);
  }

  useEffect(() => {
    if (location.hash.startsWith('#ticket=')) {
      const ticket = location.hash.slice('#ticket='.length);
      history.replaceState(null, '', location.pathname);
      post<{ account: Account }>('/api/auth/ticket', { ticket })
        .then((result) => signedIn(result.account, true))
        .catch(() => go('/login?google=expired'))
        .finally(() => setLoading(false));
      return;
    }
    get<{ account: Account }>('/api/auth/me')
      .then((result) => signedIn(result.account, false))
      .catch(() => setAccount(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!account) {
      if (path === '/account' || path === '/setup' || path === HOME) go('/login');
    } else if (businesses.length === 0) {
      if (path !== '/setup' && path !== '/status') go('/setup');
    } else if (path === '/' || path === '/login' || path === '/setup') {
      go(HOME);
    }
  }, [path, account, businesses, loading]);

  if (path === '/status') return <StatusPage />;

  if (loading) return <Card title="Loading…">{null}</Card>;

  if (path === '/setup' && account) {
    return (
      <SetupPage
        account={account}
        onAccount={setAccount}
        onLogOut={async () => {
          await post('/api/auth/logout').catch(() => undefined);
          setAccount(null);
          go('/');
        }}
        onDone={async (target) => {
          await signedIn((await get<{ account: Account }>('/api/auth/me')).account, false);
          go(target);
        }}
      />
    );
  }

  if (path === HOME && account && businesses[0]) {
    return <HomePage account={account} business={businesses[0]} onLoggedOut={() => { setAccount(null); setBusinesses([]); go('/'); }} />;
  }

  if (path === '/account' && account) {
    return (
      <AccountPage
        account={account}
        businesses={businesses}
        onChanged={setAccount}
        onLoggedOut={() => { setAccount(null); setBusinesses([]); go('/'); }}
      />
    );
  }

  if (path === '/login' || path === '/account' || path === '/setup' || path === HOME) {
    return <StartPage onSignedIn={(signed) => signedIn(signed, true)} />;
  }

  return <LandingPage />;
}
