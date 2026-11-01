import { completeFuelAmounts, fuelReceiptConsistent } from "@ride-ready/core";
import { useWatch, type Control } from "react-hook-form";
import { HelperText } from "react-native-paper";

import { formatNumber } from "@/utils/format";

import type { FuelForm } from "../logging.schemas";

const num = (v: unknown) => {
  const n = Number(
    String(v ?? "")
      .trim()
      .replace(",", ".")
  );
  return String(v ?? "").trim() === "" || Number.isNaN(n) ? null : n;
};

// Live feedback under the amounts. Two of liters / price / total typed: shows the third, which the
// schema fills in on save (completeFuelAmounts). All three typed: flags a total that doesn't add up
// (usually a mistyped digit).
export function FuelTotalCheck({
  control,
}: {
  control: Control<FuelForm, any, any>;
}) {
  const [liters, price, discount, total] = useWatch({
    control,
    name: ["liters", "pricePerLiter", "discount", "totalPaid"],
  }).map(num);
  const given = [liters, price, total].filter((n) => n != null).length;
  if (given < 2) return null;

  if (given === 2) {
    const c = completeFuelAmounts({
      liters,
      pricePerLiter: price,
      totalPaid: total,
      discount,
    });
    if (!c) return null;
    const derived =
      liters == null
        ? `Liters: ${formatNumber(c.liters, 2)}`
        : price == null
        ? `Price per liter: ${formatNumber(c.pricePerLiter, 3)}`
        : `Total: ${formatNumber(c.totalPaid, 2)}`;
    return (
      <HelperText type="info" visible accessibilityLiveRegion="polite">
        {derived} (calculated)
      </HelperText>
    );
  }

  if (
    fuelReceiptConsistent({
      liters: liters!,
      pricePerLiter: price!,
      discount: discount ?? 0,
      totalPaid: total!,
    })
  )
    return null;
  return (
    <HelperText type="info" visible accessibilityLiveRegion="polite">
      Liters × price − discount ={" "}
      {formatNumber(liters! * price! - (discount ?? 0), 2)}, but the total is{" "}
      {formatNumber(total!, 2)}. Check the numbers.
    </HelperText>
  );
}
