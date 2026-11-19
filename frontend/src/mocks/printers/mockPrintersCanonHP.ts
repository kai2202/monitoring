import { Printer } from '../../types/printer';
import { mockPrintersCanon } from './mockPrintersCanon';
import { mockPrintersHP } from './mockPrintersHP';

/**
 * Frontend/src/mocks/printers/mockPrintersCanonHP.ts
 *
 * Tổng hợp mock data Canon & HP phân rã nhỏ < 300 LOC theo AGENTS.md Rule 7.1.
 */
export const mockPrintersCanonHP: Printer[] = [
  ...mockPrintersCanon,
  ...mockPrintersHP,
];

export { mockPrintersCanon, mockPrintersHP };
