// eslint-disable-next-line max-classes-per-file
import { InMemCache, OfflineService } from '@grandlinex/core';
import SQLCon from '@grandlinex/bundle-sqlight';
import PGCon from '@grandlinex/bundle-postgresql';
import BaseKernelModule from './classes/BaseKernelModule';
import KernelDB, { KERNEL_DB_VERSION } from './database/KernelDB';
import { IKernel } from './lib';

import KernelEndpoint from './api/KernelEndpoint';
import ApiVersionAction from './actions/ApiVersionAction';
import GetTokenAction from './actions/GetTokenAction';
import ApiAuthTestAction from './actions/ApiAuthTestAction';
import GKey from './database/entity/GKey';

export default class KernelModule extends BaseKernelModule<
  KernelDB,
  null,
  InMemCache,
  KernelEndpoint
> {
  useLightDB = false;

  constructor(kernel: IKernel) {
    super('kernel', kernel);

    this.addAction(
      new ApiVersionAction(this),
      new ApiAuthTestAction(this),
      new GetTokenAction(this)
    );

    this.addService(new OfflineService(this));
  }

  async initModule(): Promise<void> {
    this.setCache(new InMemCache(this, 480000));
    let db: KernelDB;
    if (this.useLightDB) {
      db = new KernelDB(new SQLCon(this, '0'));
    } else {
      db = new KernelDB(new PGCon(this, '0'));
    }
    db.setEntityCache(true);
    db.registerEntity(new GKey());

    this.setDb(db);
    const endpoint = new KernelEndpoint(
      'api',
      this,
      this.getKernel().getAppServerPort()
    );
    this.setPresenter(endpoint);
    await this.getKernel().triggerFunction('load');
  }
}
