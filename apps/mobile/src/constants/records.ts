import type { ExpenseCategory, MaintenanceKind } from '@ride-ready/core';

// Display copy and icons for the record enums in @ride-ready/core.

export const MAINTENANCE_KIND_UI: Record<MaintenanceKind, { label: string; icon: string }> = {
  service: { label: 'Service', icon: 'oil' },
  repair: { label: 'Repair', icon: 'wrench' },
  inspection: { label: 'Inspection', icon: 'clipboard-check-outline' },
  tires: { label: 'Tires', icon: 'tire' },
  other: { label: 'Other', icon: 'dots-horizontal' },
};

export const EXPENSE_CATEGORY_UI: Record<ExpenseCategory, { label: string; icon: string }> = {
  insurance: { label: 'Insurance', icon: 'shield-car' },
  registration: { label: 'Registration', icon: 'card-account-details-outline' },
  parking: { label: 'Parking', icon: 'parking' },
  tolls: { label: 'Tolls', icon: 'boom-gate-outline' },
  tires: { label: 'Tires', icon: 'tire' },
  modification: { label: 'Modification', icon: 'tools' },
  cleaning: { label: 'Cleaning', icon: 'car-wash' },
  other: { label: 'Other', icon: 'dots-horizontal' },
};

export const CHARGER_TYPES = ['Home', 'AC public', 'DC fast'] as const;
