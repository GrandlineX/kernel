import { XRequest, XResponse } from '../lib/express.js';
import BaseAction from './BaseAction.js';

export type MetricEventStart = {
  req: XRequest;
  action: BaseAction;
};
export type MetricEventEnd<T> = MetricEventStart & {
  started: T;
  res: XResponse;
};
export abstract class BaseKernelMetric<T> {
  abstract start(event: MetricEventStart): T | null;
  abstract end(event: MetricEventEnd<T>): void;
}
