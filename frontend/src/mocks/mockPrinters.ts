/**
 * Frontend/src/mocks/mockPrinters.ts
 *
 * Mock data 35 máy in doanh nghiệp đa thương hiệu (Ricoh, Canon, HP, Epson, Zebra).
 * Phân rã thành các module < 300 LOC theo AGENTS.md Rule 7.1:
 * - mockPrintersRicoh: Máy in Ricoh (tham chiếu chính)
 * - mockPrintersCanonHP: Máy in Canon & HP
 * - mockPrintersExtended: Epson, Zebra & hạm đội đa tầng mở rộng
 *
 * Tuân thủ nghiêm ngặt: MetricValue = number | null, không actionGuidance.
 */

import { Printer } from '../types/printer';
import { mockPrintersRicoh } from './printers/mockPrintersRicoh';
import { mockPrintersCanonHP } from './printers/mockPrintersCanonHP';
import { mockPrintersExtended } from './printers/mockPrintersExtended';

export const mockPrinters: Printer[] = [
  ...mockPrintersRicoh,
  ...mockPrintersCanonHP,
  ...mockPrintersExtended,
];

export { mockPrintersRicoh, mockPrintersCanonHP, mockPrintersExtended };
