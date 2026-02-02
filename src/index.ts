import type { Meter } from '@opentelemetry/api';

import * as metrics from './metrics';
import type { NodeMetricConfig } from './types';

export function setupNodeMetrics(meter: Meter, config?: NodeMetricConfig) {
  Object.values(metrics).forEach((metric) => {
    metric(meter, config);
  });
}

export * from './types';

export const NodeMetrics = metrics;
