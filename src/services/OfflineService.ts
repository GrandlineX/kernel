import dns = require('dns');
import BaseLoopService from '../classes/BaseLoopService';
import { IBaseKernelModule } from '../lib';

export default class OfflineService extends BaseLoopService {
  constructor(module: IBaseKernelModule<any, any, any, any>) {
    super('offlineService', 60000, module);
    this.loop = this.loop.bind(this);
  }

  async loop() {
    const a = !(await this.checkInternet());
    this.getKernel().setOffline(a);
    this.debug(a);
    await this.next();
  }

  checkInternet(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      dns.lookup('google.com', (err) => {
        if (err && err.code === 'ENOTFOUND') {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
