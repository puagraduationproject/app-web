import { ButtonLink, Card } from '../shared/layout/Card';

export function LandingPage() {
  return (
    <Card title="One AI for every small business" subtitle="It runs your chats, orders, stock and cash.">
      <ButtonLink href="/login">Get started</ButtonLink>
      <ButtonLink href="/login" kind="secondary">Log in</ButtonLink>
    </Card>
  );
}
