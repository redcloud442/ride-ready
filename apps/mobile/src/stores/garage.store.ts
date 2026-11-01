import { create } from 'zustand';

// Client-only garage state. Vehicle data itself lives in TanStack Query (hooks/use-vehicles.ts).
type GarageState = {
  selectedVehicleId: string | null;
  selectVehicle: (id: string | null) => void;
};

export const useGarageStore = create<GarageState>((set) => ({
  selectedVehicleId: null,
  selectVehicle: (id) => set({ selectedVehicleId: id }),
}));
