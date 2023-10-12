export interface NodeMetricConfig {
  prefix?: string;
  labels?: Record<string, string>;
  eventLoopMonitoringPrecision?: number;
}
