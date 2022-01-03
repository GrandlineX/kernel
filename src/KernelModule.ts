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
    this.setCache(new InMemCache(this, 480000));
    let db: KernelDB;
    if (this.useLightDB) {
      class Db extends SQLCon {
        constructor(mod: KernelModule) {
          super(mod, KERNEL_DB_VERSION);
        }

        initNewDB(): Promise<void> {
          return Promise.resolve(undefined);
        }
      }
      db = new KernelDB(new Db(this));
    } else {
      class Db extends PGCon {
        constructor(mod: KernelModule) {
          super(mod, KERNEL_DB_VERSION);
        }

        initNewDB(): Promise<void> {
          return Promise.resolve(undefined);
        }
      }
      db = new KernelDB(new Db(this));
    }
    db.setEntityCache(true);
    db.registerEntity(new GKey());

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
