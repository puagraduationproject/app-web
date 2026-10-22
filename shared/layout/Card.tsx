import type { ReactNode } from 'react';

export function Card({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">EdaraPilot</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-6 space-y-4">{children}</div>
      </div>
    </main>
  );
}

export function Field(props: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  inputMode?: 'numeric' | 'email' | 'text';
  autoFocus?: boolean;
  maxLength?: number;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
  onBlur?: () => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{props.label}</span>
      <input
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        type={props.type ?? 'text'}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        onBlur={props.onBlur}
        autoComplete={props.autoComplete}
        inputMode={props.inputMode}
        autoFocus={props.autoFocus}
        maxLength={props.maxLength}
        placeholder={props.placeholder}
        dir={props.dir}
        required={props.required ?? true}
      />
    </label>
  );
}

export function Button({ children, busy, kind = 'primary', onClick, type = 'submit' }: {
  children: ReactNode;
  busy?: boolean;
  kind?: 'primary' | 'secondary';
  onClick?: () => void;
  type?: 'submit' | 'button';
}) {
  const look =
    kind === 'primary'
      ? 'bg-slate-900 text-white hover:bg-slate-700'
      : 'bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy}
      className={`w-full rounded-lg px-4 py-2.5 font-medium transition disabled:opacity-60 ${look}`}
    >
      {busy ? 'Please wait…' : children}
    </button>
  );
}

export function ButtonLink({ href, children, kind = 'primary' }: { href: string; children: ReactNode; kind?: 'primary' | 'secondary' }) {
  const look =
    kind === 'primary'
      ? 'bg-slate-900 text-white hover:bg-slate-700'
      : 'bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50';
  return (
    <a href={href} className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium transition ${look}`}>
      {children}
    </a>
  );
}

export function LinkButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="text-sm text-slate-600 underline disabled:no-underline disabled:opacity-60">
      {children}
    </button>
  );
}

export function ErrorText({ text }: { text: string }) {
  return text ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{text}</p> : null;
}
