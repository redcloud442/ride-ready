import { usesCharging, usesFuel, type Propulsion } from '@ride-ready/core';
import { Divider } from 'react-native-paper';

import type { VehicleStatsResponse } from '@/api/stats.api';
import { Card } from '@/components/ui/card';
import { StatColumns, type StatColumn } from '@/components/ui/stat-columns';
import { formatMoney, formatNumber } from '@/utils/format';

// How the owner drives and refuels: averages of recorded values only; "—" says what's missing.
export function HabitsCard({ stats, propulsion, index }: { stats: VehicleStatsResponse; propulsion: Propulsion; index?: number }) {
  const { fillUps, charging, currency } = stats.details;
  const money = (v: number | null) => (v != null && currency ? formatMoney(v, currency, 3) : null);

  const fuelRow: StatColumn[] = [
    {
      label: 'Fill-ups',
      value: String(fillUps.count),
      note: fillUps.avgDaysBetween != null ? `every ${formatNumber(fillUps.avgDaysBetween, 0)} days` : fillUps.count ? 'one so far' : 'Log a fill-up',
    },
    {
      label: 'Price / L',
      value: money(fillUps.avgPricePerLiter),
      note:
        fillUps.minPricePerLiter != null && fillUps.maxPricePerLiter != null && fillUps.maxPricePerLiter > fillUps.minPricePerLiter
          ? `${money(fillUps.minPricePerLiter)} – ${money(fillUps.maxPricePerLiter)}`
          : fillUps.avgPricePerLiter != null
            ? 'average paid'
            : 'Needs a fill-up',
    },
    {
      label: 'Avg fill',
      value: fillUps.avgLiters != null ? `${formatNumber(fillUps.avgLiters, 1)} L` : null,
      note: fillUps.avgLiters != null ? 'per fill-up' : 'Needs a fill-up',
    },
  ];
  const chargeRow: StatColumn[] = [
    {
      label: 'Charges',
      value: String(charging.count),
      note: charging.count ? 'sessions' : 'Log a charge',
    },
    {
      label: 'Cost / kWh',
      value: money(charging.avgCostPerKwh),
      note: charging.avgCostPerKwh != null ? 'average paid' : 'Needs a paid charge',
    },
    {
      label: 'Avg charge',
      value: charging.avgKwh != null ? `${formatNumber(charging.avgKwh, 1)} kWh` : null,
      note: charging.avgKwh != null ? 'bought per session' : 'Needs a charge',
    },
  ];

  const fuel = usesFuel(propulsion);
  const charge = usesCharging(propulsion);
  return (
    <Card index={index}>
      {fuel && <StatColumns columns={fuelRow} />}
      {fuel && charge && <Divider />}
      {charge && <StatColumns columns={chargeRow} />}
    </Card>
  );
}
