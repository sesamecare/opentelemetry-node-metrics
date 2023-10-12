import { NodeMetricConfig } from '../types';

export function prefixedName(config: NodeMetricConfig | undefined, name: string) {
  return `${config?.prefix || ''}${name}`;
}
