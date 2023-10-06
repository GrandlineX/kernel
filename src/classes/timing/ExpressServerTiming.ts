import { CoreElement } from '@grandlinex/core';
import ServerTiming from './ServerTiming.js';
import { XResponse } from '../../lib/express.js';

export type IExtensionInterface = {
  done: () => void;
  timing: ExpressServerTiming;
};
export default class ExpressServerTiming {
  private timing: ServerTiming;

  private baseApiAction: CoreElement<any> & { forceDebug?: boolean };

  constructor(baseApiAction: CoreElement<any>) {
    this.timing = new ServerTiming();
    this.baseApiAction = baseApiAction;
  }

  start(chanel: string) {
    return this.timing.start(chanel);
  }

  async startFunc<T>(chanel: string, fc: () => Promise<T>): Promise<T> {
    return this.timing.startFunc<T>(chanel, fc);
  }

  async dbQuery<T>(fc: () => Promise<T>): Promise<T> {
    return this.timing.startFunc<T>('db', fc);
  }

  getHeader() {
    const out: string[] = [];
    this.timing.map.forEach((element, key) => {
      let dur = 0;
      element.forEach((el) => {
        dur += el.getDuration();
      });
      out.push(`${key};dur=${dur}`);
    });
    return out.join(', ');
  }

  addHeader(res: XResponse) {
    if (
      this.timing.map.size > 0 &&
      (this.baseApiAction.getKernel().getDevMode() ||
        this.baseApiAction.forceDebug)
    ) {
      const a = ['Server-Timing', this.getHeader()];
      res.setHeader(a[0], a[1]);
      this.baseApiAction.debug(a);
    }
  }

  static init(
    baseApiAction: CoreElement<any>,
    res: XResponse,
  ): [ExpressServerTiming, () => void] {
    const el = new ExpressServerTiming(baseApiAction);
    const total = el.start('total');
    return [
      el,
      () => {
        total.stop();
        el.addHeader(res);
      },
    ];
  }
}
