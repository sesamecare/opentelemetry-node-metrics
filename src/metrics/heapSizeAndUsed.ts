import type { Meter } from '@opentelemetry/api';

import type { NodeMetricConfig } from '../types.js';
import { safeMemoryUsage } from '../helpers/safeMemoryUsage.js';
import { prefixedName } from '../helpers/counterNames.js';

const NODEJS_HEAP_SIZE_TOTAL = 'nodejs_heap_size_total_bytes';
const NODEJS_HEAP_SIZE_USED = 'nodejs_heap_size_used_bytes';
const NODEJS_EXTERNAL_MEMORY = 'nodejs_external_memory_bytes';

export function heapSizeAndUsedMetric(meter: Meter, config?: NodeMetricConfig) {
  let stats: ReturnType<typeof safeMemoryUsage> | undefined | false;

  function getStats() {
    if (stats !== undefined) {
      return stats;
    }
    stats = safeMemoryUsage() || false;
    setTimeout(() => {
      stats = undefined;
    }, 1000).unref();
    return stats;
  }

  meter
    .createObservableGauge(prefixedName(config, NODEJS_HEAP_SIZE_TOTAL), {
      description: 'Process heap size from Node.js in bytes.',
    })
    .addCallback((observable) => {
      if (!getStats() || !stats) {
        return;
      }
      observable.observe(stats.heapTotal, config?.labels);
    });

  meter
    .createObservableGauge(prefixedName(config, NODEJS_HEAP_SIZE_USED), {
      description: 'Process heap size used from Node.js in bytes.',
    })
    .addCallback((observable) => {
      if (!getStats() || !stats) {
        return;
      }
      observable.observe(stats.heapUsed, config?.labels);
    });

  meter
    .createObservableGauge(prefixedName(config, NODEJS_EXTERNAL_MEMORY), {
      description: 'Node.js external memory size in bytes.',
    })
    .addCallback((observable) => {
      if (!getStats() || !stats) {
        return;
      }
      if (stats.external === undefined) {
        return;
      }
      observable.observe(stats.external, config?.labels);
    });
}

heapSizeAndUsedMetric.metricNames = [
  NODEJS_HEAP_SIZE_TOTAL,
  NODEJS_HEAP_SIZE_USED,
  NODEJS_EXTERNAL_MEMORY,
];
