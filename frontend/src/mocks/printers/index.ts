/**
 * Frontend/src/mocks/printers/index.ts
 *
 * Barrel export cho toàn bộ Mock Data thuộc domain Máy in (Printers & Fleet Scale).
 * Tuân thủ AGENTS.md Rule 7.1.
 */

export * from './mockPrintersRicoh';
export * from './mockPrintersCanonHP';
export * from './mockPrintersExtended';
export { mockPrinters } from '../mockPrinters';
export * from '../scale/mockFleetScaleBase';

