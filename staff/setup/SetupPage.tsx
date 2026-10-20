import { useEffect, useState, type FormEvent } from 'react';
import { Button, Card, ErrorText, Field, LinkButton } from '../../shared/layout/Card';
import { ApiError, get, messageFor, post, type Account, type Business } from '../../shared/tools-client/api';

type Type = Business['business_type'];
type Check = { available: boolean; reason: 'invalid' | 'reserved' | 'taken' | null };

const types: [Type, string, string][] = [
  ['coffee_shop', 'Café or coffee shop', 'Drinks, snacks, tables'],
  ['restaurant', 'Restaurant or food', 'Meals, delivery, kitchen'],
  ['bakery', 'Bakery or sweets', 'Fresh goods, orders ahead'],
  ['small_market', 'Grocery or small market', 'Everyday goods, barcodes, debts'],
  ['pharmacy', 'Pharmacy', 'Medicines, expiry dates'],
  ['clothing', 'Clothes and fashion', 'Sizes, colors, seasons'],
  ['electronics', 'Phones and electronics', 'Devices, accessories, repairs'],
  ['beauty', 'Salon, barber or beauty', 'Services and bookings'],
  ['services', 'Other services', 'Repairs, cleaning, lessons, ...'],
  ['online', 'Online shop', 'You sell through social media or a website'],
  ['other', 'Something else', 'Start with the basics'],
];

const checkText: Record<NonNullable<Check['reason']>, string> = {
  invalid: '3 to 30 small letters, digits or dashes.',
  reserved: 'This name is kept for the app. Pick another.',
  taken: 'Another business has it. Pick another.',
};

export function handleFrom(name: string) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .slice(0, 30)
    .replace(/^-+|-+$/g, '');
}

export function SetupPage({ account, onCreated, onLogOut }: {
  account: Account;
  onCreated: (business: Business) => void;
  onLogOut: () => void;
}) {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [handleEdited, setHandleEdited] = useState(false);
  const [check, setCheck] = useState<Check | null>(null);
  const [type, setType] = useState<Type | null>(null);
  const [team, setTeam] = useState<'alone' | 'team'>('alone');
  const [yourName, setYourName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Business | null>(null);

  useEffect(() => {
    if (!handleEdited) setHandle(handleFrom(name));
  }, [name, handleEdited]);

  useEffect(() => {
    setCheck(null);
    if (!handle) return;
    const timer = setTimeout(() => {
      get<Check>(`/api/app/handles/${encodeURIComponent(handle)}`).then(setCheck).catch(() => setCheck(null));
    }, 400);
    return () => clearTimeout(timer);
  }, [handle]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!type) return setError('Pick what kind of business it is.');
    setBusy(true);
    setError('');
    try {
      const body = { name, handle, business_type: type, team_size: team, ...(account.name ? {} : { your_name: yourName }) };
      const result = await post<{ business: Business }>('/api/app/businesses', body);
      setCreated(result.business);
    } catch (failure) {
      if (failure instanceof ApiError && failure.code === 'handle_taken') setCheck({ available: false, reason: 'taken' });
      setError(messageFor(failure));
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    return (
      <Card title={`${created.name} is ready`}>
        {created.team_size === 'team' && (
          <p className="text-sm text-slate-600">Inviting your team comes in a later step. You'll find it in Settings.</p>
        )}
        <Button type="button" onClick={() => onCreated(created)}>Continue</Button>
      </Card>
    );
  }

  return (
    <Card title="Set up your business" subtitle="A few questions. You can change all of it later.">
      <form onSubmit={submit} className="space-y-5">
        {!account.name && <Field label="Your name" value={yourName} onChange={setYourName} autoComplete="name" maxLength={80} autoFocus />}

        <Field label="Business name" value={name} onChange={setName} autoFocus={Boolean(account.name)} maxLength={80} />

        <div>
          <Field
            label="Business handle"
            value={handle}
            onChange={(value) => { setHandleEdited(true); setHandle(value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30)); }}
            maxLength={30}
          />
          <p className="mt-1 text-xs text-slate-500">Its unique name in the app. Small letters, digits and dashes.</p>
          {check && !check.available && check.reason && <p className="mt-1 text-xs text-rose-700">{checkText[check.reason]}</p>}
          {check?.available && <p className="mt-1 text-xs text-emerald-700">Available</p>}
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">What kind of business?</legend>
          {types.map(([value, label, hint]) => (
            <Choice key={value} name="type" checked={type === value} onChange={() => setType(value)} label={label} hint={hint} />
          ))}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">Who works in it?</legend>
          <Choice name="team" checked={team === 'alone'} onChange={() => setTeam('alone')} label="Just me" />
          <Choice name="team" checked={team === 'team'} onChange={() => setTeam('team')} label="Me and a team" />
        </fieldset>

        <ErrorText text={error} />
        <Button busy={busy}>Build my business</Button>
      </form>
      <div className="text-center">
        <LinkButton onClick={onLogOut}>Log out</LinkButton>
      </div>
    </Card>
  );
}

function Choice({ name, checked, onChange, label, hint }: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className={`flex cursor-pointer gap-3 rounded-lg px-3 py-2 ring-1 ${checked ? 'ring-slate-900' : 'ring-slate-200'}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="mt-1" />
      <span>
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </span>
    </label>
  );
}
