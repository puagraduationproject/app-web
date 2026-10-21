import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { direction, texts, type Language } from '../../shared/i18n';
import { Button, Card, ErrorText, Field, LinkButton } from '../../shared/layout/Card';
import { ApiError, get, messageFor, post, type Account, type Business, type BusinessType } from '../../shared/tools-client/api';

type Step = 'language' | 'your_name' | 'business_name' | 'business_type' | 'location';
type Check = { available: boolean; reason: 'invalid' | 'reserved' | 'taken' | null };
type Names = Check & { handle: string; username: string };
type SetupInfo = { business_types: { key: BusinessType; ready: boolean }[]; cities: string[] };

// The one place the shop page address is written (design 20). ALL-002 2.5 may
// change it to <shop>.<domain> or <domain>/s/<shop>.
export const shopAddress = (handle: string) => `${location.host}/${handle}`;

// Which step asks for each field the backend can refuse.
const stepOf: Record<string, Step> = {
  your_name: 'your_name',
  name: 'business_name',
  handle: 'business_name',
  business_type: 'business_type',
  sells: 'business_type',
  city: 'location',
  area: 'location',
};

const report = (step: Step | 'done') => post('/api/app/setup/steps', { step }).catch(() => undefined);

export function SetupPage({ account, onAccount, onDone, onLogOut }: {
  account: Account;
  onAccount: (account: Account) => void;
  onDone: (path: string) => void;
  onLogOut: () => void;
}) {
  const [language, setLanguage] = useState<Language>(account.language);
  const [step, setStep] = useState<Step>('language');
  const [info, setInfo] = useState<SetupInfo | null>(null);
  const [yourName, setYourName] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [handleEdited, setHandleEdited] = useState(false);
  const [editingHandle, setEditingHandle] = useState(false);
  const [recheck, setRecheck] = useState(0);
  const [check, setCheck] = useState<Check | null>(null);
  const [username, setUsername] = useState('');
  const [type, setType] = useState<BusinessType | null>(null);
  const [sells, setSells] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Business | null>(null);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const t = texts[language].setup;
  const words = texts[language];
  const steps: Step[] = ['language', ...(account.name ? [] : ['your_name' as const]), 'business_name', 'business_type', 'location'];
  const index = steps.indexOf(step);

  function loadInfo() {
    get<SetupInfo>('/api/app/setup').then(setInfo).catch((failure) => setError(messageFor(failure, language)));
  }

  useEffect(loadInfo, []);

  useEffect(() => {
    report(step);
  }, [step]);

  useEffect(() => setError(''), [yourName, name, handle, type, sells, city, area]);

  // The handle follows the business name until the person types their own,
  // and again once they clear it (ALL-002 3.5).
  useEffect(() => {
    if (handleEdited) return;
    setCheck(null);
    if (!name.trim()) return setHandle('');
    let current = true;
    const timer = setTimeout(() => {
      const query = new URLSearchParams({ name: name.trim(), ...(yourName.trim() ? { your_name: yourName.trim() } : {}) });
      get<Names>(`/api/app/names?${query}`)
        .then((names) => {
          if (!current) return;
          setHandle(names.handle);
          setUsername(names.username);
          setCheck({ available: names.available, reason: names.reason });
        })
        .catch(() => current && setCheck(null));
    }, 400);
    return () => { current = false; clearTimeout(timer); };
  }, [name, yourName, recheck]);

  useEffect(() => {
    if (!handleEdited) return;
    setCheck(null);
    if (!handle) return;
    let current = true;
    const timer = setTimeout(() => {
      get<Check>(`/api/app/handles/${encodeURIComponent(handle)}`)
        .then((result) => current && setCheck(result))
        .catch(() => current && setCheck(null));
    }, 400);
    return () => { current = false; clearTimeout(timer); };
  }, [handle, handleEdited, recheck]);

  function pickLanguage(picked: Language) {
    setLanguage(picked);
    setError('');
    post<{ account: Account }>('/api/auth/language', { language: picked })
      .then((result) => onAccount(result.account))
      .catch(() => undefined);
  }

  function editHandle(value: string) {
    const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);
    setHandle(clean);
    setHandleEdited(clean !== '');
  }

  function problem(): string {
    if (step === 'your_name' && !yourName.trim()) return t.yourNameMissing;
    if (step === 'business_name') {
      if (!name.trim()) return t.businessNameMissing;
      if (!handle) return t.handleMissing;
      if (!check) return t.handleChecking;
      if (!check.available && check.reason) return t.handleProblems[check.reason];
    }
    if (step === 'business_type' && !type) return t.businessTypeMissing;
    if (step === 'location') {
      if (!city) return t.cityMissing;
      if (!area.trim()) return t.areaMissing;
    }
    return '';
  }

  async function next(event: FormEvent) {
    event.preventDefault();
    const found = problem();
    if (found) {
      // A handle problem is already written under the handle.
      if (step === 'business_name' && check && !check.available) return setEditingHandle(true);
      if (step === 'business_name' && handle && !check) setRecheck((count) => count + 1);
      return setError(found);
    }
    setError('');
    if (step !== 'location') return setStep(steps[index + 1]!);

    setBusy(true);
    try {
      const body = {
        name: name.trim(),
        handle,
        business_type: type,
        ...(type === 'other' && sells.trim() ? { sells: sells.trim() } : {}),
        city,
        area: area.trim(),
        ...(account.name ? {} : { your_name: yourName.trim() }),
        idempotency_key: idempotencyKey,
      };
      const result = await post<{ business: Business }>('/api/app/businesses', body);
      setCreated(result.business);
      report('done');
    } catch (failure) {
      if (failure instanceof ApiError && failure.code === 'handle_taken') {
        setHandleEdited(true);
        setEditingHandle(true);
        setCheck({ available: false, reason: 'taken' });
        return setStep('business_name');
      }
      const at = failure instanceof ApiError && stepOf[failure.field ?? ''];
      if (at && steps.includes(at)) setStep(at);
      setError(messageFor(failure, language));
    } finally {
      setBusy(false);
    }
  }

  function back() {
    setError('');
    setStep(steps[index - 1]!);
  }

  if (created) {
    const ready = info?.business_types.find((kind) => kind.key === created.business_type)?.ready ?? false;
    return (
      <Page language={language}>
        <Card title={ready ? t.readyTitle(created.name) : t.setUpTitle(created.name)} subtitle={ready ? t.readyLine : t.notReady}>
          <Preview label={t.shopPage} value={shopAddress(created.handle)} />
          <p className="text-sm font-medium text-slate-700">{t.firstSteps}</p>
          <Button type="button" onClick={() => onDone('/home?start=menu_photo')}>{t.menuPhoto}</Button>
          <Button type="button" kind="secondary" onClick={() => onDone('/home?start=add_product')}>{t.addProduct}</Button>
          <Button type="button" kind="secondary" onClick={() => onDone('/home?start=connect_telegram')}>{t.connectTelegram}</Button>
          <div className="text-center">
            <LinkButton onClick={() => onDone('/home')}>{t.goHome}</LinkButton>
          </div>
          <p className="text-center text-xs text-slate-500">{t.defaults}</p>
        </Card>
      </Page>
    );
  }

  const titles: Record<Step, string> = {
    language: t.language,
    your_name: t.yourName,
    business_name: t.businessName,
    business_type: t.businessType,
    location: t.location,
  };

  return (
    <Page language={language}>
      <Card title={titles[step]} subtitle={step === 'language' ? t.subtitle : undefined}>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{t.progress(index + 1, steps.length)}</span>
          <LanguageSwitch language={language} onPick={pickLanguage} />
        </div>

        <form onSubmit={next} noValidate className="space-y-5">
          {step === 'language' && (
            <fieldset className="space-y-2">
              <Choice name="language" checked={language === 'ar'} onChange={() => pickLanguage('ar')} label="العربية" />
              <Choice name="language" checked={language === 'en'} onChange={() => pickLanguage('en')} label="English" />
            </fieldset>
          )}

          {step === 'your_name' && (
            <div>
              <Field label={t.yourNameLabel} value={yourName} onChange={setYourName} autoComplete="name" maxLength={80} autoFocus />
              <p className="mt-1 text-xs text-slate-500">{t.yourNameHint}</p>
            </div>
          )}

          {step === 'business_name' && (
            <>
              <Field label={t.businessNameLabel} value={name} onChange={setName} maxLength={80} autoFocus />
              {(handle || editingHandle) && (
                <div className="space-y-2 rounded-lg bg-slate-50 p-3">
                  {editingHandle && (
                    <div>
                      <Field
                        label={t.handle}
                        value={handle}
                        onChange={editHandle}
                        onBlur={() => !handle && setRecheck((count) => count + 1)}
                        maxLength={30}
                        dir="ltr"
                        autoFocus
                      />
                      <p className="mt-1 text-xs text-slate-500">{t.handleHelp}</p>
                    </div>
                  )}
                  {handle && <Preview label={t.shopPage} value={shopAddress(handle)} />}
                  {handle && username && <Preview label={t.teamLogIn} value={`${username}@${handle}`} />}
                  {check?.available && <p className="text-xs text-emerald-700">{t.available}</p>}
                  {check && !check.available && check.reason && <p className="text-xs text-rose-700">{t.handleProblems[check.reason]}</p>}
                  <p className="text-xs text-slate-500">{t.branches}</p>
                  {!editingHandle && <LinkButton onClick={() => setEditingHandle(true)}>{t.change}</LinkButton>}
                </div>
              )}
            </>
          )}

          {step === 'business_type' && (
            info ? (
              <fieldset className="space-y-2">
                {info.business_types.map((kind) => (
                  <Choice
                    key={kind.key}
                    name="type"
                    checked={type === kind.key}
                    onChange={() => setType(kind.key)}
                    label={words.kinds[kind.key] ?? kind.key}
                    hint={kind.ready ? t.ready : undefined}
                  />
                ))}
                {type && !info.business_types.find((kind) => kind.key === type)?.ready && (
                  <p className="text-sm text-slate-600">{t.notReady}</p>
                )}
                {type === 'other' && (
                  <div>
                    <Field label={t.sells} value={sells} onChange={setSells} maxLength={120} required={false} autoFocus />
                    <p className="mt-1 text-xs text-slate-500">{t.sellsHint}</p>
                  </div>
                )}
              </fieldset>
            ) : (
              <div className="text-center">
                <LinkButton onClick={loadInfo}>{t.loading}</LinkButton>
              </div>
            )
          )}

          {step === 'location' && (
            <>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">{t.city}</span>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  autoFocus
                >
                  <option value="" disabled>{t.pickCity}</option>
                  {(info?.cities ?? []).map((key) => <option key={key} value={key}>{words.cities[key] ?? key}</option>)}
                </select>
              </label>
              <Field label={t.area} value={area} onChange={setArea} maxLength={60} placeholder={t.areaHint} />
            </>
          )}

          <ErrorText text={error} />
          <Button busy={busy}>{step === 'location' ? t.build : t.next}</Button>
        </form>

        <div className="flex items-center justify-between">
          {index > 0 ? <LinkButton onClick={back}>{t.back}</LinkButton> : <span />}
          <LinkButton onClick={onLogOut}>{t.logOut}</LinkButton>
        </div>
      </Card>
    </Page>
  );
}

function Page({ language, children }: { language: Language; children: ReactNode }) {
  return <div dir={direction(language)} lang={language}>{children}</div>;
}

function LanguageSwitch({ language, onPick }: { language: Language; onPick: (language: Language) => void }) {
  const option = (value: Language, label: string) => (
    <button
      type="button"
      lang={value}
      onClick={() => onPick(value)}
      className={language === value ? 'font-semibold text-slate-900' : 'text-slate-500 underline'}
      aria-pressed={language === value}
    >
      {label}
    </button>
  );
  return <span className="flex gap-2">{option('ar', 'العربية')}<span aria-hidden>·</span>{option('en', 'English')}</span>;
}

function Preview({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-slate-600">
      {label}
      <span className="block break-all font-mono text-slate-900"><bdi dir="ltr">{value}</bdi></span>
    </p>
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
        {hint && <span className="block text-xs text-emerald-700">{hint}</span>}
      </span>
    </label>
  );
}
