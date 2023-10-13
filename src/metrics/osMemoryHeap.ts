import { Meter } from '@opentelemetry/api';

import { NodeMetricConfig } from '../types';
import { prefixedName } from '../helpers/counterNames';
import { safeMemoryUsage } from '../helpers/safeMemoryUsage';

import { osMemoryHeapLinuxMetric } from './osMemoryHeapLinux';

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
