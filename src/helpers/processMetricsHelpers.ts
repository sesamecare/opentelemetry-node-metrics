import type { Attributes, ObservableResult } from '@opentelemetry/api';

export function createAggregatorByObjectName() {
  const all = new Map<string, Record<string, string>>();
  return function aggregateByObjectName(
    metric: ObservableResult<Attributes>,
    labels: Record<string, string> | undefined,
    list: string[],
  ) {
    const current = new Map<string, number>();
    for (const key of all.keys()) {
      current.set(key, 0);
    }

    for (let i = 0; i < list.length; i++) {
      current.set(list[i], (current.get(list[i]) || 0) + 1);
    }

    for (const [key, value] of current) {
      const metricLabels = all.get(key) || { ...labels, type: key };
      metric.observe(value, metricLabels);
      all.set(key, metricLabels);
    }
  };
}
