import { describe, expect, test } from 'vitest';
import { metrics } from '@opentelemetry/api';

import { setupNodeMetrics } from './index';

describe('Module exports', () => {
  test('should export expected elements', () => {
    expect(typeof setupNodeMetrics).toBe('function');

    const meter = metrics.getMeter('test');
    expect(() => setupNodeMetrics(meter)).not.toThrow();
  });
});
