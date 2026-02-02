import type { Meter } from '@opentelemetry/api';

import type { NodeMetricConfig } from '../types';
import { prefixedName } from '../helpers/counterNames';

const NODE_VERSION_INFO = 'nodejs_version_info';

export function versionMetric(meter: Meter, config?: NodeMetricConfig) {
  const versionSegments = process.version.slice(1).split('.').map(Number);
  const version = {
    ...config?.labels,
    version: process.version,
    major: versionSegments[0],
    minor: versionSegments[1],
    patch: versionSegments[2],
  };
  meter
    .createUpDownCounter(prefixedName(config, NODE_VERSION_INFO), {
      description: 'Node.js version info',
    })
    .add(1, version);
}

versionMetric.metricNames = [NODE_VERSION_INFO];
