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
    this.addAction(new ApiVersionAction(this));
    this.addAction(new ApiAuthTestAction(this));
    this.addAction(new GetTokenAction(this));
    this.addService(new OfflineService(this));
  }

  async initModule(): Promise<void> {
    const db = new KernelDB(this, '0');
    this.setDb(db);
    const endpoint = new KernelEndpoint(
      'api',
      this,
      this.getKernel().getAppServerPort()
    );
    this.setEndpoint(endpoint);
  }

  async startup(): Promise<void> {
    //
  }
}
