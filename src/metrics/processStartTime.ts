import { Meter } from '@opentelemetry/api';

import { NodeMetricConfig } from '../types';
import { prefixedName } from '../helpers/counterNames';

const startInSeconds = Math.round(Date.now() / 1000 - process.uptime());
const PROCESS_START_TIME = 'process_start_time_seconds';

export function processStartTimeMetric(meter: Meter, config?: NodeMetricConfig) {
  meter
    .createUpDownCounter(prefixedName(config, PROCESS_START_TIME), {
      description: 'Start time of the process since unix epoch in seconds.',
    })
    .add(startInSeconds, config?.labels);
}

processStartTimeMetric.metricNames = [PROCESS_START_TIME];
