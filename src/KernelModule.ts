import { BackgroundService, InMemCache } from '@grandlinex/core';
import BaseKernelModule from './classes/BaseKernelModule';
import type { IKernel } from './lib';

import KernelEndpoint from './api/KernelEndpoint';
import ApiVersionAction from './actions/ApiVersionAction';
import GetTokenAction from './actions/GetTokenAction';
import ApiAuthTestAction from './actions/ApiAuthTestAction';
import RefreshTokenAction from './actions/RefreshTokenAction';

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
      new GetTokenAction(this),
      new RefreshTokenAction(this),
    );
  }

  async initModule(): Promise<void> {
    this.addService(new BackgroundService(this));
    const endpoint = new KernelEndpoint(
      'api',
      this,
      this.getKernel().getAppServerPort(),
    );
    this.setPresenter(endpoint);
    await this.getKernel().triggerEvent('load');
  }
}
