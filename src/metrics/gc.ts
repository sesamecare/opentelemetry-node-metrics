import type { PerformanceNodeEntry } from 'perf_hooks';
import { PerformanceObserver, constants } from 'perf_hooks';

import type { Meter } from '@opentelemetry/api';

import type { NodeMetricConfig } from '../types.js';
import { prefixedName } from '../helpers/counterNames.js';

const NODEJS_GC_DURATION_SECONDS = 'nodejs_gc_duration_seconds';

interface GCDetail {
  kind?: number;
}

function keyForDetail(detail: unknown): number | string {
  if (typeof detail === 'object' && detail !== null && 'kind' in detail) {
    return (detail as GCDetail).kind ?? 'other';
  }
  return 'other';
}

export function gcMetric(meter: Meter, config?: NodeMetricConfig) {
  const histogram = meter.createHistogram(prefixedName(config, NODEJS_GC_DURATION_SECONDS), {
    description: 'Garbage collection duration by kind, one of major, minor, incremental or weakcb.',
  });

  const kinds: Record<number | string, Record<string, string>> = {};
  kinds[constants.NODE_PERFORMANCE_GC_MAJOR] = { ...config?.labels, kind: 'major' };
  kinds[constants.NODE_PERFORMANCE_GC_MINOR] = { ...config?.labels, kind: 'minor' };
  kinds[constants.NODE_PERFORMANCE_GC_INCREMENTAL] = { ...config?.labels, kind: 'incremental' };
  kinds[constants.NODE_PERFORMANCE_GC_WEAKCB] = { ...config?.labels, kind: 'weakcb' };
  kinds['other'] = { ...config?.labels, kind: 'other' };

  const obs = new PerformanceObserver((list) => {
    const entry = list.getEntries()[0] as PerformanceNodeEntry;
    // Convert duration from milliseconds to seconds
    histogram.record(entry.duration / 1000, kinds[keyForDetail(entry.detail)]);
  });

  // We do not expect too many gc events per second, so we do not use buffering
  obs.observe({ entryTypes: ['gc'], buffered: false });
}

gcMetric.metricNames = [NODEJS_GC_DURATION_SECONDS];
