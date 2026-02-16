import type { Meter } from '@opentelemetry/api';

import type { NodeMetricConfig } from '../types.js';
import { prefixedName } from '../helpers/counterNames.js';
import { safeMemoryUsage } from '../helpers/safeMemoryUsage.js';

import { osMemoryHeapLinuxMetric } from './osMemoryHeapLinux.js';

const PROCESS_RESIDENT_MEMORY = 'process_resident_memory_bytes';

export function osMemoryHeapMetric(meter: Meter, config?: NodeMetricConfig) {
  if (process.platform === 'linux') {
    return osMemoryHeapLinuxMetric(meter, config);
  }

  meter
    .createObservableGauge(prefixedName(config, PROCESS_RESIDENT_MEMORY), {
      description: 'Resident memory size in bytes.',
    })
    .addCallback((observable) => {
      const memUsage = safeMemoryUsage();
      // I don't think the other things returned from
      // `process.memoryUsage()` is relevant to a standard export
      if (memUsage) {
        observable.observe(memUsage.rss, config?.labels);
      }
    });
}

osMemoryHeapMetric.metricNames =
  process.platform === 'linux' ? osMemoryHeapLinuxMetric.metricNames : [PROCESS_RESIDENT_MEMORY];
