import { describe, expect, test } from 'vitest';

import { setupNodeMetrics } from './index';

describe('Module exports', () => {
  test('should export expected elements', () => {
    expect(typeof setupNodeMetrics).toBe('function');
  });
});
