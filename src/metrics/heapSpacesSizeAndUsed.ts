import v8 from 'v8';

import type { Meter } from '@opentelemetry/api';

import type { NodeMetricConfig } from '../types.js';
import { prefixedName } from '../helpers/counterNames.js';

const METRICS = ['total', 'used', 'available'];
const NODEJS_HEAP_SIZE: Record<string, string> = {};

for (const metricType of METRICS) {
  NODEJS_HEAP_SIZE[metricType] = `nodejs_heap_space_size_${metricType}_bytes`;
}

interface HeapStat {
  value: number;
  labels: Record<string, string>;
}

interface Stats<T> {
  total: T;
  used: T;
  available: T;
}

interface SpaceLabel {
  space: string;
  [key: string]: string;
}

export function heapSpacesSizeAndUsedMetric(meter: Meter, config?: NodeMetricConfig) {
  const labelsBySpace: Record<string, Stats<SpaceLabel>> = {};
  let stats: Stats<HeapStat>[] | undefined;
  function getStats() {
    if (stats !== undefined) {
      return stats;
    }
    stats = v8.getHeapSpaceStatistics().map((space) => {
      const spaceLabels =
        labelsBySpace[space.space_name] ||
        (function () {
          const spaceName = space.space_name.replace(/_space$/, '');
          labelsBySpace[space.space_name] = {
            total: { ...config?.labels, space: spaceName },
            used: { ...config?.labels, space: spaceName },
            available: { ...config?.labels, space: spaceName },
          };
          return labelsBySpace[space.space_name];
        })();

      return {
        total: { value: space.space_size, labels: spaceLabels.total },
        used: { value: space.space_used_size, labels: spaceLabels.used },
        available: { value: space.space_available_size, labels: spaceLabels.available },
      };
    });

    setTimeout(() => {
      stats = undefined;
    }, 1000).unref();
    return stats;
  }

  meter
    .createObservableGauge(prefixedName(config, NODEJS_HEAP_SIZE.total), {
      description: 'Process heap space size total from Node.js in bytes.',
    })
    .addCallback((observable) => {
      if (!getStats() || !stats) {
        return;
      }
      for (let i = 0; i < stats.length; i++) {
        observable.observe(stats[i].total.value, stats[i].total.labels);
      }
    });

  meter
    .createObservableGauge(prefixedName(config, NODEJS_HEAP_SIZE.used), {
      description: 'Process heap space size used from Node.js in bytes.',
    })
    .addCallback((observable) => {
      if (!getStats() || !stats) {
        return;
      }
      for (let i = 0; i < stats.length; i++) {
        observable.observe(stats[i].used.value, stats[i].used.labels);
      }
    });

  meter
    .createObservableGauge(prefixedName(config, NODEJS_HEAP_SIZE.available), {
      description: 'Process heap space size available from Node.js in bytes.',
    })
    .addCallback((observable) => {
      if (!getStats() || !stats) {
        return;
      }
      for (let i = 0; i < stats.length; i++) {
        observable.observe(stats[i].available.value, stats[i].available.labels);
      }
    });
}

heapSpacesSizeAndUsedMetric.metricNames = Object.values(NODEJS_HEAP_SIZE);
