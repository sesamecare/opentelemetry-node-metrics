import type { Meter } from '@opentelemetry/api';

import type { NodeMetricConfig } from '../types';
import { prefixedName } from '../helpers/counterNames';

const PROCESS_CPU_USER_SECONDS = 'process_cpu_user_seconds_total';
const PROCESS_CPU_SYSTEM_SECONDS = 'process_cpu_system_seconds_total';
const PROCESS_CPU_SECONDS = 'process_cpu_seconds_total';

export function processCpuTotalMetric(meter: Meter, config?: NodeMetricConfig) {
  let lastCpuUsage = process.cpuUsage();

  const cpuUserUsageCounter = meter.createCounter(prefixedName(config, PROCESS_CPU_USER_SECONDS), {
    description: 'Total user CPU time spent in seconds.',
  });

  const cpuSystemUsageCounter = meter.createCounter(
    prefixedName(config, PROCESS_CPU_SYSTEM_SECONDS),
    {
      description: 'Total system CPU time spent in seconds.',
    },
  );

  meter
    .createObservableCounter(prefixedName(config, PROCESS_CPU_SECONDS), {
      description: 'Total user and system CPU time spent in seconds.',
    })
    .addCallback((observable) => {
      const cpuUsage = process.cpuUsage();
      const userUsageSecs = (cpuUsage.user - lastCpuUsage.user) / 1e6;
      const systemUsageSecs = (cpuUsage.system - lastCpuUsage.system) / 1e6;
      lastCpuUsage = cpuUsage;

      cpuUserUsageCounter.add(userUsageSecs, config?.labels);
      cpuSystemUsageCounter.add(systemUsageSecs, config?.labels);
      observable.observe((cpuUsage.user + cpuUsage.system) / 1e6, config?.labels);
    });

  cpuUserUsageCounter.add(lastCpuUsage.user / 1e6, config?.labels);
  cpuSystemUsageCounter.add(lastCpuUsage.system / 1e6, config?.labels);
}

processCpuTotalMetric.metricNames = [
  PROCESS_CPU_USER_SECONDS,
  PROCESS_CPU_SYSTEM_SECONDS,
  PROCESS_CPU_SECONDS,
];
