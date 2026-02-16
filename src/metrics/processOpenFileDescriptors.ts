import fs from 'fs';
import process from 'node:process';

import type { Meter } from '@opentelemetry/api';

import type { NodeMetricConfig } from '../types.js';
import { prefixedName } from '../helpers/counterNames.js';

const PROCESS_OPEN_FDS = 'process_open_fds';

export function processOpenFileDescriptorsMetric(meter: Meter, config?: NodeMetricConfig) {
  if (process.platform !== 'linux') {
    return;
  }

  meter
    .createObservableGauge(prefixedName(config, PROCESS_OPEN_FDS), {
      description: 'Number of open file descriptors.',
    })
    .addCallback((observable) => {
      try {
        const fds = fs.readdirSync('/proc/self/fd');
        // Minus 1 to not count the fd that was used by readdirSync(),
        // it's now closed.
        observable.observe(fds.length - 1, config?.labels);
      } catch {
        // noop
      }
    });
}

processOpenFileDescriptorsMetric.metricNames = [PROCESS_OPEN_FDS];
