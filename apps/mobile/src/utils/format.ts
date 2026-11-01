import { getLocales } from 'expo-localization';

const locale = () => getLocales()[0]?.languageTag ?? 'en-US';

/** Device currency, used as the default in money fields. */
export const defaultCurrency = () => getLocales()[0]?.currencyCode ?? 'USD';

/** `digits` overrides the currency's usual decimals, e.g. 3 for a price per liter. */
export function formatMoney(amount: number, currency: string, digits?: number) {
  const fraction = digits == null ? {} : { minimumFractionDigits: digits, maximumFractionDigits: digits };
  try {
    return new Intl.NumberFormat(locale(), { style: 'currency', currency, ...fraction }).format(amount);
  } catch {
    return `${amount.toFixed(digits ?? 2)} ${currency}`; // unknown currency code
  }
}

export const formatNumber = (value: number, maxDecimals = 0) =>
  new Intl.NumberFormat(locale(), { maximumFractionDigits: maxDecimals }).format(value);

export const formatKm = (km: number) => `${formatNumber(km)} km`;

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

/** "1:05:09" / "12:03" from milliseconds. */
export function formatDuration(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const [h, m, sec] = [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60];
  const pad = (n: number) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

export const formatTime = (date: Date) =>
  new Intl.DateTimeFormat(locale(), { hour: 'numeric', minute: '2-digit' }).format(date);

/** "Today", "Yesterday", else a short date. */
export function formatDay(date: Date, now = new Date()) {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(date)) / 86_400_000);
  return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : formatDate(date);
}
