import { InMemCache, OfflineService } from '@grandlinex/core';
import BaseKernelModule from './classes/BaseKernelModule.js';
import { IKernel } from './lib/index.js';

import KernelEndpoint from './api/KernelEndpoint.js';
import ApiVersionAction from './actions/ApiVersionAction.js';
import GetTokenAction from './actions/GetTokenAction.js';
import ApiAuthTestAction from './actions/ApiAuthTestAction.js';

export default class KernelModule extends BaseKernelModule<
  IKernel,
  null,
  null,
  InMemCache,
  KernelEndpoint
> {
  constructor(kernel: IKernel) {
    super('base-mod', kernel);

    this.addAction(
      new ApiVersionAction(this),
      new ApiAuthTestAction(this),
      new GetTokenAction(this)
    );
  }

  async initModule(): Promise<void> {
    this.addService(new OfflineService(this));
    const endpoint = new KernelEndpoint(
      'api',
      this,
      this.getKernel().getAppServerPort()
    );
    this.setPresenter(endpoint);
    await this.getKernel().triggerFunction('load');
  }
}
