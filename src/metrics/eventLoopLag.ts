import perfHooks from 'perf_hooks';

import { Meter } from '@opentelemetry/api';

import { NodeMetricConfig } from '../types';
import { prefixedName } from '../helpers/counterNames';

// Reported always.
const NODEJS_EVENTLOOP_LAG = 'nodejs_eventloop_lag_seconds';

// Reported only when perf_hooks is available.
const NODEJS_EVENTLOOP_LAG_MIN = 'nodejs_eventloop_lag_min_seconds';
const NODEJS_EVENTLOOP_LAG_MAX = 'nodejs_eventloop_lag_max_seconds';
const NODEJS_EVENTLOOP_LAG_MEAN = 'nodejs_eventloop_lag_mean_seconds';
const NODEJS_EVENTLOOP_LAG_STDDEV = 'nodejs_eventloop_lag_stddev_seconds';
const NODEJS_EVENTLOOP_LAG_P50 = 'nodejs_eventloop_lag_p50_seconds';
const NODEJS_EVENTLOOP_LAG_P90 = 'nodejs_eventloop_lag_p90_seconds';
const NODEJS_EVENTLOOP_LAG_P99 = 'nodejs_eventloop_lag_p99_seconds';

export function eventLoopLagMetric(meter: Meter, config?: NodeMetricConfig) {
  const histogram = perfHooks.monitorEventLoopDelay({
    resolution: config?.eventLoopMonitoringPrecision,
  });

  histogram.enable();

  meter
    .createObservableGauge(prefixedName(config, NODEJS_EVENTLOOP_LAG_MIN), {
      description: 'The minimum recorded event loop delay.',
    })
    .addCallback((observable) => {
      observable.observe(histogram.min / 1e9, config?.labels);
    });

  meter
    .createObservableGauge(prefixedName(config, NODEJS_EVENTLOOP_LAG_MAX), {
      description: 'The maximum recorded event loop delay.',
    })
    .addCallback((observable) => {
      observable.observe(histogram.max / 1e9, config?.labels);
    });

  meter
    .createObservableGauge(prefixedName(config, NODEJS_EVENTLOOP_LAG_MEAN), {
      description: 'The mean of the recorded event loop delays.',
    })
    .addCallback((observable) => {
      observable.observe(histogram.mean / 1e9, config?.labels);
    });

  meter
    .createObservableGauge(prefixedName(config, NODEJS_EVENTLOOP_LAG_STDDEV), {
      description: 'The standard deviation of the recorded event loop delays.',
    })
    .addCallback((observable) => {
      observable.observe(histogram.stddev / 1e9, config?.labels);
    });

  meter
    .createObservableGauge(prefixedName(config, NODEJS_EVENTLOOP_LAG_P50), {
      description: 'The 50th percentile of the recorded event loop delays.',
    })
    .addCallback((observable) => {
      observable.observe(histogram.percentile(50) / 1e9, config?.labels);
    });

  meter
    .createObservableGauge(prefixedName(config, NODEJS_EVENTLOOP_LAG_P90), {
      description: 'The 90th percentile of the recorded event loop delays.',
    })
    .addCallback((observable) => {
      observable.observe(histogram.percentile(90) / 1e9, config?.labels);
    });

  meter
    .createObservableGauge(prefixedName(config, NODEJS_EVENTLOOP_LAG_P99), {
      description: 'The 99th percentile of the recorded event loop delays.',
    })
    .addCallback((observable) => {
      observable.observe(histogram.percentile(99) / 1e9, config?.labels);
    });
}

eventLoopLagMetric.metricNames = [
  NODEJS_EVENTLOOP_LAG,
  NODEJS_EVENTLOOP_LAG_MIN,
  NODEJS_EVENTLOOP_LAG_MAX,
  NODEJS_EVENTLOOP_LAG_MEAN,
  NODEJS_EVENTLOOP_LAG_STDDEV,
  NODEJS_EVENTLOOP_LAG_P50,
  NODEJS_EVENTLOOP_LAG_P90,
  NODEJS_EVENTLOOP_LAG_P99,
];
