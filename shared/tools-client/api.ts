import { texts, type Language } from '../i18n';

export type Account = {
  email: string;
  name: string | null;
  phone: string | null;
  language: 'ar' | 'en';
  has_password: boolean;
  has_google: boolean;
  created_at: string;
};

export class ApiError extends Error {
  constructor(
    readonly code: string,
    readonly field?: string,
    readonly retryAfterSeconds?: number,
  ) {
    super(code);
  }
}

export type BusinessType = 'coffee_shop' | 'small_market' | 'grocery' | 'bakery' | 'restaurant' | 'other';

export type Business = {
  name: string;
  handle: string;
  business_type: BusinessType;
  sells: string | null;
  team_size: 'alone' | 'team' | null;
  role: 'owner' | 'manager' | 'staff' | 'viewer';
  username: string;
  display_name: string;
};

export type Session = {
  id: string;
  browser: string;
  ip: string;
  created_at: string;
  last_seen_at: string;
  current: boolean;
};

export function get<T>(path: string): Promise<T> {
  return send<T>(path, { method: 'GET' });
}

export function post<T>(path: string, body: object = {}): Promise<T> {
  return send<T>(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
}

async function send<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, init);
  } catch {
    throw new ApiError('network');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = data.error ?? {};
    throw new ApiError(error.code ?? 'server_error', error.field, error.retry_after_seconds);
  }
  return data as T;
}

export function messageFor(error: unknown, language: Language = 'en'): string {
  const code = error instanceof ApiError ? error.code : 'server_error';
  return texts[language].errors[code] ?? texts[language].somethingWrong;
}
