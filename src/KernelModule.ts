import { OfflineService } from '@grandlinex/core';
import BaseKernelModule from './classes/BaseKernelModule';
import KernelDB from './database/KernelDB';
import { IKernel } from './lib';

import KernelEndpoint from './api/KernelEndpoint';
import ApiVersionAction from './actions/ApiVersionAction';
import GetTokenAction from './actions/GetTokenAction';
import ApiAuthTestAction from './actions/ApiAuthTestAction';
import KernelDBLight from './database/KernelDBLight';

export default class KernelModule extends BaseKernelModule<
  KernelDB | KernelDBLight,
  null,
  null,
  KernelEndpoint
> {
  useLightDB = false;

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
    let db;
    if (this.useLightDB) {
      db = new KernelDBLight(this);
    } else {
      db = new KernelDB(this);
    }
    this.setDb(db);
    const endpoint = new KernelEndpoint(
      'api',
      this,
      this.getKernel().getAppServerPort()
    );
    this.setEndpoint(endpoint);
    await this.getKernel().triggerFunction('load');
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
