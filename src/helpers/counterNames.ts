import type { NodeMetricConfig } from '../types.js';

export function prefixedName(config: NodeMetricConfig | undefined, name: string) {
  return `${config?.prefix || ''}${name}`;
}
