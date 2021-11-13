import CoreKernel from '@grandlinex/core';
import { unwatchFile } from 'fs';
import ELogger from '@grandlinex/bundle-elogger';
import { ICClient, IKernel } from './lib';
import KernelModule from './KernelModule';
import CryptoClient from './modules/crypto/CryptoClient';

/**
 *  @class Kernel
 */

export default class Kernel extends CoreKernel<ICClient> implements IKernel {
  private expressPort: number;

  /**
   * Default Constructor
   * @param options App Name
   */
  constructor(options: {
    appName: string;
    appCode: string;
    pathOverride?: string;
    portOverride?: number;
    envFilePath?: string;
  }) {
    super(options);
    this.globalLogger = new ELogger(this);
    this.setLogger(this.globalLogger);
    this.setBaseModule(new KernelModule(this));
    if (options.portOverride) {
      this.debug(`use custiom api port @ ${options.portOverride}`);
      this.expressPort = options.portOverride;
    } else {
      this.expressPort = 9257;
    }
    const store = this.getConfigStore();
    if (store.has('SERVER_PASSWORD')) {
      this.setCryptoClient(
        new CryptoClient(
          CryptoClient.fromPW(store.get('SERVER_PASSWORD') as string),
          this
        )
      );
    }
  }

  getAppServerPort(): number {
    return this.expressPort;
  }

  setAppServerPort(port: number): void {
    this.expressPort = port;
  }
}
