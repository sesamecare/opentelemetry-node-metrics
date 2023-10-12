import { Meter } from '@opentelemetry/api';

import * as metrics from './metrics';
import { NodeMetricConfig } from './types';

export function setupNodeMetrics(meter: Meter, config: NodeMetricConfig) {
  metrics.versionMetric(meter, config);
  metrics.processStartTimeMetric(meter, config);
}

export * from './types';

export const NodeMetrics = metrics;

