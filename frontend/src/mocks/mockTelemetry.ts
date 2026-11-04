/**
 * Frontend/src/mocks/mockTelemetry.ts
 *
 * Mock data phân tích đo lường từ xa (Telemetry):
 * Phân rã thành các module < 300 LOC theo AGENTS.md Rule 7.1:
 * - mockTelemetryOverview: Volume Trend, Availability Timeline, Lemon Devices, Reliability
 * - mockTelemetryVolumeRankings: Top Volume Rankings & Daily Point Generator
 *
 * Tuân thủ nghiêm ngặt: MetricValue = number | null, không actionGuidance.
 */

export * from './telemetry/mockTelemetryOverview';
export * from './telemetry/mockTelemetryVolumeRankings';
