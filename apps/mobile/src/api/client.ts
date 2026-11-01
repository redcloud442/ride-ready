import { authClient } from '@/lib/auth-client';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

// JSON fetch against apps/api. The session cookie lives in SecureStore, so it is attached by hand.
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${path}`, {
    ...init,
    credentials: 'omit',
    headers: {
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      Cookie: await authClient.getCookie(),
      ...init.headers,
    },
  });
  if (!res.ok) throw new ApiError(res.status, await errorMessage(res));
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// The API answers errors as { error: string }. 5xx bodies are generic by design, except 503,
// which states an unavailable feature.
async function errorMessage(res: Response) {
  try {
    const body = (await res.json()) as { error?: unknown };
    if (typeof body.error === 'string' && (res.status < 500 || res.status === 503)) return body.error;
  } catch {
    // non-JSON body
  }
  return res.status >= 500 ? 'Something went wrong on our side. Try again.' : `Request failed (${res.status})`;
}
