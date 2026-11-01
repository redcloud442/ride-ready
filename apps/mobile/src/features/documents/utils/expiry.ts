const DAY = 86_400_000;
export const EXPIRY_WARNING_DAYS = 60;

export type ExpiryStatus = 'none' | 'ok' | 'soon' | 'expired';

export function expiryStatus(expiresAt: string | null, now = new Date()): ExpiryStatus {
  if (!expiresAt) return 'none';
  const ms = new Date(expiresAt).getTime() - now.getTime();
  return ms < 0 ? 'expired' : ms <= EXPIRY_WARNING_DAYS * DAY ? 'soon' : 'ok';
}

export const daysUntil = (expiresAt: string, now = new Date()) => Math.ceil((new Date(expiresAt).getTime() - now.getTime()) / DAY);
