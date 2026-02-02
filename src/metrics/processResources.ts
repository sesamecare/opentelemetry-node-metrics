import nodeProcess from 'node:process';

import type { Meter } from '@opentelemetry/api';

import type { NodeMetricConfig } from '../types';
import { createAggregatorByObjectName } from '../helpers/processMetricsHelpers';
import { prefixedName } from '../helpers/counterNames';

const NODEJS_ACTIVE_RESOURCES = 'nodejs_active_resources';
const NODEJS_ACTIVE_RESOURCES_TOTAL = 'nodejs_active_resources_total';

export function processHandlesMetric(meter: Meter, config?: NodeMetricConfig) {
  const { getActiveResourcesInfo } = nodeProcess as { getActiveResourcesInfo?: () => string[] };

  // Don't do anything if the function is not available
  if (typeof getActiveResourcesInfo !== 'function') {
    return;
  }

  const aggregateByObjectName = createAggregatorByObjectName();
  meter
    .createObservableGauge(prefixedName(config, NODEJS_ACTIVE_RESOURCES), {
      description:
        'Number of active libuv handles grouped by handle type. Every handle type is C++ class name.',
    })
    .addCallback((observable) => {
      aggregateByObjectName(observable, config?.labels, getActiveResourcesInfo());
    });

  meter
    .createObservableGauge(prefixedName(config, NODEJS_ACTIVE_RESOURCES_TOTAL), {
      description: 'Total number of active handles.',
    })
    .addCallback((observable) => {
      const handles = getActiveResourcesInfo();
      observable.observe(handles.length, config?.labels);
    });
}

processHandlesMetric.metricNames = [NODEJS_ACTIVE_RESOURCES, NODEJS_ACTIVE_RESOURCES_TOTAL];
