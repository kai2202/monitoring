export const DEVICE_PALETTE = [
  '#2563eb', // Blue
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#84cc16', // Lime
  '#d97706', // Warm Amber
  '#9333ea', // Purple
];

export interface MockFleetDeviceDefinition {
  id: string;
  name: string;
  model: string;
  brand: string;
  floorId: 'floor-1' | 'floor-2' | 'floor-3' | 'floor-4' | 'floor-5';
  floorName: string;
  department: string;
  baseHourly: number[];
  base7Days: number[];
  base30Days: number[];
  ppmNominal: number;
  ppmActual: number;
  uptimePercent: number;
  mtbfHours: number;
  failureCount: number;
  downtimeHours: number;
  monoRatio: number;
  tonerK: number;
  tonerC: number;
  tonerM: number;
  tonerY: number;
  drumLife: number;
  wasteToner: 'OK' | 'Sắp đầy' | 'Đầy';
}

