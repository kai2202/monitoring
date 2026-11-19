/**
 * Frontend/src/features/printers/utils/deviceSize.ts
 *
 * Phân loại kích thước / kiểu dáng máy in thành 2 nhóm trực quan:
 * - 'desktop': Máy nhỏ để bàn (Mono Laser, Industrial Thermal) -> icon faPrint
 * - 'large':   Máy công nghiệp / Cỡ lớn (Color MFP, Mono MFP, Large Format Plotter) -> icon faLayerGroup
 */

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faPrint, faLayerGroup } from '@/shared/icons';
import { DeviceType } from '@/types/printer';

export type PrinterSizeCategory = 'desktop' | 'large';

export interface PrinterSizeMeta {
  category: PrinterSizeCategory;
  label: string;
  shortLabel: string;
  icon: IconDefinition;
}

const LARGE_DEVICE_TYPES = new Set<string>([
  'Color MFP',
  'Mono MFP',
  'Large Format Plotter',
]);

export function getPrinterSizeCategory(deviceType?: DeviceType | string): PrinterSizeCategory {
  if (deviceType && LARGE_DEVICE_TYPES.has(deviceType)) return 'large';
  return 'desktop';
}

export function getPrinterSizeMeta(deviceType?: DeviceType | string): PrinterSizeMeta {
  const category = getPrinterSizeCategory(deviceType);
  if (category === 'large') {
    return {
      category: 'large',
      label: 'Máy công nghiệp / Cỡ lớn',
      shortLabel: 'Cỡ lớn',
      icon: faLayerGroup,
    };
  }
  return {
    category: 'desktop',
    label: 'Máy nhỏ để bàn',
    shortLabel: 'Để bàn',
    icon: faPrint,
  };
}
