import fs from 'fs';

import { Meter } from '@opentelemetry/api';

import { NodeMetricConfig } from '../types';
import { prefixedName } from '../helpers/counterNames';

const PROCESS_MAX_FDS = 'process_max_fds';

let maxFds: number | undefined;

export function processMaxFileDescriptorsMetric(meter: Meter, config?: NodeMetricConfig) {
  if (maxFds === undefined) {
    // This will fail if a linux-like procfs is not available.
    try {
      const limits = fs.readFileSync('/proc/self/limits', 'utf8');
      const lines = limits.split('\n');
      for (const line of lines) {
        if (line.startsWith('Max open files')) {
          const parts = line.split(/  +/);
          maxFds = Number(parts[1]);
          break;
        }
      }
    } catch {
      return;
    }
  }

  if (maxFds === undefined) {
    return;
  }

  meter
    .createUpDownCounter(prefixedName(config, PROCESS_MAX_FDS), {
      description: 'Maximum number of open file descriptors.',
    })
    .add(maxFds, config?.labels);
}
