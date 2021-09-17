import BaseKernelModule from './classes/BaseKernelModule';
import KernelDB from './database/KernelDB';
import { IKernel } from './lib';

import OfflineService from './services/OfflineService';
import KernelEndpoint from './api/KernelEndpoint';
import ApiVersionAction from './actions/ApiVersionAction';
import GetTokenAction from './actions/GetTokenAction';
import ApiAuthTestAction from './actions/ApiAuthTestAction';

export default class KernelModule extends BaseKernelModule<
  KernelDB,
  null,
  null,
  KernelEndpoint
> {
  constructor(kernel: IKernel) {
    super('kernel', kernel);

    [
      new ApiVersionAction(this),
      new ApiAuthTestAction(this),
      new GetTokenAction(this),
    ].forEach((action) => {
      this.addAction(action);
    });

    [new OfflineService(this)].forEach((service) => {
      this.addService(service);
    });
  }

  async initModule(): Promise<void> {
    const db = new KernelDB(this);
    this.setDb(db);
    const endpoint = new KernelEndpoint(
      'api',
      this,
      this.getKernel().getAppServerPort()
    );
    this.setEndpoint(endpoint);
    await this.getKernel().trigerFunction('load');
  }

  async startup(): Promise<void> {
    return Promise.resolve();
  }

  async beforeServiceStart(): Promise<void> {
    return Promise.resolve();
  }

  async final(): Promise<void> {
    return Promise.resolve();
  }
}
