import fs from 'fs';

import type { Meter } from '@opentelemetry/api';

import type { NodeMetricConfig } from '../types.js';
import { prefixedName } from '../helpers/counterNames.js';

const values = ['VmSize', 'VmRSS', 'VmData'];

const PROCESS_RESIDENT_MEMORY = 'process_resident_memory_bytes';
const PROCESS_VIRTUAL_MEMORY = 'process_virtual_memory_bytes';
const PROCESS_HEAP = 'process_heap_bytes';

function structureOutput(input: string) {
  const returnValue: Record<string, number> = {};

  input
    .split('\n')
    .filter((s) => values.some((value) => s.indexOf(value) === 0))
    .forEach((string: string) => {
      const split = string.split(':');

      // Get the value
      let value = split[1].trim();
      // Remove trailing ` kb`
      value = value.substring(0, value.length - 3);
      // Make it into a number in bytes bytes
      const numericValue = Number(value) * 1024;

      returnValue[split[0]] = numericValue;
    });

  return returnValue;
}

export function osMemoryHeapLinuxMetric(meter: Meter, config?: NodeMetricConfig) {
  let stats: ReturnType<typeof structureOutput> | undefined | false;

  function getStats() {
    if (stats !== undefined) {
      return stats;
    }

    try {
      const stat = fs.readFileSync('/proc/self/status', 'utf8');
      stats = structureOutput(stat);
    } catch {
      stats = false;
    }
    setTimeout(() => {
      stats = undefined;
    }, 1000).unref();
    return stats;
  }

  meter
    .createObservableGauge(prefixedName(config, PROCESS_RESIDENT_MEMORY), {
      description: 'Resident memory size in bytes.',
    })
    .addCallback((observable) => {
      if (!getStats() || !stats) {
        return;
      }
      observable.observe(stats.VmRSS, config?.labels);
    });

  meter
    .createObservableGauge(prefixedName(config, PROCESS_VIRTUAL_MEMORY), {
      description: 'Virtual memory size in bytes.',
    })
    .addCallback((observable) => {
      if (!getStats() || !stats) {
        return;
      }
      observable.observe(stats.VmSize, config?.labels);
    });

  meter
    .createObservableGauge(prefixedName(config, PROCESS_HEAP), {
      description: 'Process heap size in bytes.',
    })
    .addCallback((observable) => {
      if (!getStats() || !stats) {
        return;
      }
      observable.observe(stats.VmData, config?.labels);
    });
}

osMemoryHeapLinuxMetric.metricNames = [
  PROCESS_RESIDENT_MEMORY,
  PROCESS_VIRTUAL_MEMORY,
  PROCESS_HEAP,
];
