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

export type Business = {
  name: string;
  handle: string;
  business_type: 'coffee_shop' | 'small_market' | 'other';
  team_size: 'alone' | 'team';
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

const messages: Record<string, string> = {
  invalid_input: 'Please check what you typed.',
  wrong_code: "That code isn't right. Check it and try again.",
  code_expired: 'This code has expired. Ask for a new one.',
  too_many_tries: 'Too many wrong codes. Ask for a new one.',
  too_soon: 'Please wait a moment before asking for a new code.',
  wrong_password: "The email and password don't match.",
  locked: 'Too many wrong passwords. Try again in a few minutes.',
  no_password: 'This account has no password yet. Use a code or Google.',
  ticket_invalid: 'This step has expired. Please start again.',
  outside_failed: "We couldn't send the email. Please try again.",
  limit_reached: 'Too many tries. Please wait a little.',
  handle_taken: 'Another business has this handle. Pick another.',
  not_logged_in: 'You were logged out. Please log in again.',
  not_found: 'That device is already logged out.',
  bad_origin: 'This request was blocked. Please reload the page.',
  network: "We couldn't reach the server. Check your connection.",
};

export function messageFor(error: unknown): string {
  const code = error instanceof ApiError ? error.code : 'server_error';
  return messages[code] ?? 'Something went wrong. Please try again.';
}
