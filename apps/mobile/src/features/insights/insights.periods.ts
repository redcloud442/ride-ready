// Calendar-aligned periods: boundaries only change at month starts, so query keys stay stable.
export const PERIODS = [
  { value: '1m', label: 'This month', months: 1, compare: 'vs same day last month' },
  { value: '3m', label: '3 months', months: 3, compare: 'vs previous 3 months' },
  { value: '12m', label: '12 months', months: 12, compare: 'vs previous 12 months' },
] as const;

export type PeriodKey = (typeof PERIODS)[number]['value'];

export function periodRange(key: PeriodKey, now = new Date()) {
  const months = PERIODS.find((p) => p.value === key)!.months;
  return {
    from: new Date(now.getFullYear(), now.getMonth() - (months - 1), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 1),
  };
}

export const compareLabel = (key: PeriodKey) => PERIODS.find((p) => p.value === key)!.compare;
