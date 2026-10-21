import { direction, texts } from '../../shared/i18n';
import { ButtonLink, Card, LinkButton } from '../../shared/layout/Card';
import { post, type Account, type Business } from '../../shared/tools-client/api';

// A stand-in until Home is built (team-handoffs FE-004), so that setup ends on
// Home and not on My account (ALL-002 3.1). Replace it with the real Home.
export function HomePage({ account, business, onLoggedOut }: {
  account: Account;
  business: Business;
  onLoggedOut: () => void;
}) {
  const t = texts[account.language].home;
  const started = new URLSearchParams(location.search).has('start');

  async function logOut() {
    await post('/api/auth/logout').catch(() => undefined);
    onLoggedOut();
  }

  return (
    <div dir={direction(account.language)} lang={account.language}>
      <Card title={t.welcome(business.display_name)} subtitle={t.firstLine}>
        <p className="text-sm text-slate-600">
          {business.name} · <bdi dir="ltr">{business.username}@{business.handle}</bdi>
        </p>
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{started ? t.aiNotConnected : t.comingSoon}</p>
        <ButtonLink href="/account" kind="secondary">{t.myAccount}</ButtonLink>
        <div className="text-center">
          <LinkButton onClick={logOut}>{t.logOut}</LinkButton>
        </div>
      </Card>
    </div>
  );
}
