import CoreKernel from '@grandlinex/core';
import { unwatchFile } from 'fs';
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
   * @param appName App Name
   * @param appCode App Code (Only lower case)
   * @param domain set the external endpoint
   * @param pathOverride set base path for config folder
   * @param portOverride overwrites the default port
   */
  constructor(
    appName: string,
    appCode: string,
    pathOverride?: string,
    portOverride?: number
  ) {
    super(appName, appCode, pathOverride);
    this.setBaseModule(new KernelModule(this));
    if (portOverride) {
      this.debug(`use custiom api port @ ${portOverride}`);
      this.expressPort = portOverride;
    } else {
      this.expressPort = 9257;
    }
    if (process.env.SERVER_PASSWOR !== undefined) {
      this.setCryptoClient(
        new CryptoClient(
          CryptoClient.fromPW(process.env.SERVER_PASSWOR as string),
          this
        )
      );
    }
    if (process.env.PUBLICDOMAIN) {
      this.globalConfig.net = {
        port: this.expressPort,
        domain: process.env.PUBLICDOMAIN,
      };
    }
  }

  getAppServerPort(): number {
    return this.expressPort;
  }

  setAppServerPort(port: number): void {
    this.expressPort = port;
  }
}
