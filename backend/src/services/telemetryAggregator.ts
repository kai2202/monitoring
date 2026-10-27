/**
 * src/services/telemetryAggregator.ts
 *
 * Domain logic for aggregating historical counter data from Zabbix,
 * calculating delta production, and generating chronological buckets (hourly, daily).
 */

import { ZabbixHistoryPoint } from '../types/zabbix.js';
import { MetricValue, TelemetryBucket } from '../types/api.js';

export function calculateDeltaFromHistory(points: ZabbixHistoryPoint[]): MetricValue {
  if (!points || points.length === 0) return null;
  if (points.length === 1) return 0;

  const sorted = [...points].sort((a, b) => Number(a.clock) - Number(b.clock));
  let totalDelta = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prev = parseInt(sorted[i - 1].value, 10);
    const curr = parseInt(sorted[i].value, 10);
    if (!isNaN(prev) && !isNaN(curr) && curr >= prev) {
      totalDelta += (curr - prev);
    }
  }
  return totalDelta;
}

export function formatBucketLabel(unixSec: number, format: 'hour' | 'day'): string {
  const d = new Date(unixSec * 1000);
  if (format === 'hour') {
    return d.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } else {
    return d.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
    });
  }
}

export function generateEmptyBuckets(
  startTimeSec: number,
  bucketCount: number,
  bucketSeconds: number,
  labelFormat: 'hour' | 'day'
): TelemetryBucket[] {
  const buckets: TelemetryBucket[] = [];
  for (let i = 0; i < bucketCount; i++) {
    const bStart = startTimeSec + i * bucketSeconds;
    buckets.push({
      timestamp: new Date(bStart * 1000).toISOString(),
      timeLabel: formatBucketLabel(bStart, labelFormat),
      pagesPrinted: null,
      status: 'no_data',
    });
  }
  return buckets;
}

export function aggregateHistoryToBuckets(
  history: ZabbixHistoryPoint[],
  startTimeSec: number,
  bucketCount: number,
  bucketSeconds: number,
  labelFormat: 'hour' | 'day'
): TelemetryBucket[] {
  const sorted = [...history].sort((a, b) => Number(a.clock) - Number(b.clock));
  const buckets: TelemetryBucket[] = [];

  for (let i = 0; i < bucketCount; i++) {
    const bStart = startTimeSec + i * bucketSeconds;
    const bEnd = bStart + bucketSeconds;
    const timeLabel = formatBucketLabel(bStart, labelFormat);
    const isoTimestamp = new Date(bStart * 1000).toISOString();

    const bucketSamples = sorted.filter(s => {
      const c = Number(s.clock);
      return c >= bStart && c < bEnd;
    });

    const samplesBefore = sorted.filter(s => Number(s.clock) < bStart);
    const lastSampleBefore = samplesBefore.length > 0 ? samplesBefore[samplesBefore.length - 1] : null;
    const samplesAfter = sorted.filter(s => Number(s.clock) >= bEnd);

    if (bucketSamples.length === 0) {
      if (!lastSampleBefore) {
        // No sample ever recorded before this bucket
        buckets.push({
          timestamp: isoTimestamp,
          timeLabel,
          pagesPrinted: null,
          status: 'no_data',
        });
      } else if (samplesAfter.length === 0) {
        // Prior samples exist, current time is in or near bucket, counter hasn't changed
        buckets.push({
          timestamp: isoTimestamp,
          timeLabel,
          pagesPrinted: 0,
          status: 'complete',
        });
      } else {
        const prevVal = parseInt(lastSampleBefore.value, 10);
        const nextVal = parseInt(samplesAfter[0].value, 10);
        if (!isNaN(prevVal) && !isNaN(nextVal) && nextVal === prevVal) {
          buckets.push({
            timestamp: isoTimestamp,
            timeLabel,
            pagesPrinted: 0,
            status: 'complete',
          });
        } else {
          buckets.push({
            timestamp: isoTimestamp,
            timeLabel,
            pagesPrinted: null,
            status: 'incomplete',
          });
        }
      }
    } else {
      let delta = 0;
      let baselineVal = lastSampleBefore ? parseInt(lastSampleBefore.value, 10) : parseInt(bucketSamples[0].value, 10);

      for (let j = 0; j < bucketSamples.length; j++) {
        const currVal = parseInt(bucketSamples[j].value, 10);
        if (!isNaN(baselineVal) && !isNaN(currVal) && currVal >= baselineVal) {
          delta += (currVal - baselineVal);
        }
        baselineVal = currVal;
      }

      buckets.push({
        timestamp: isoTimestamp,
        timeLabel,
        pagesPrinted: delta,
        status: 'complete',
      });
    }
  }

  return buckets;
}
