import { InMemCache, OfflineService } from '@grandlinex/core';
import BaseKernelModule from './classes/BaseKernelModule';
import { IKernel } from './lib';

import KernelEndpoint from './api/KernelEndpoint';
import ApiVersionAction from './actions/ApiVersionAction';
import GetTokenAction from './actions/GetTokenAction';
import ApiAuthTestAction from './actions/ApiAuthTestAction';

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

    this.addService(new OfflineService(this));
  }

  async initModule(): Promise<void> {
    const endpoint = new KernelEndpoint(
      'api',
      this,
      this.getKernel().getAppServerPort()
    );
    this.setPresenter(endpoint);
    await this.getKernel().triggerFunction('load');
  }
}
