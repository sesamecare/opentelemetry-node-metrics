import type { Meter } from '@opentelemetry/api';

import * as metrics from './metrics/index.js';
import type { NodeMetricConfig } from './types.js';

export function setupNodeMetrics(meter: Meter, config?: NodeMetricConfig) {
  Object.values(metrics).forEach((metric) => {
    metric(meter, config);
  });
}

export type * from './types';

export const NodeMetrics = metrics;
