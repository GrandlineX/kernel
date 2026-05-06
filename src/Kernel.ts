import { CoreKernel, CoreKernelProps } from '@grandlinex/core';
import { ICClient, IKernel } from './lib/index.js';
import CryptoClient from './modules/crypto/CryptoClient.js';
import KernelModule from './KernelModule.js';
import { BaseKernelMetric } from './classes/index.js';

/**
 *  @class Kernel
 */

export default class Kernel extends CoreKernel<ICClient> implements IKernel {
  private expressPort: number;

  private readonly apiVersion: number;

  protected metric: BaseKernelMetric<unknown> | null;

  /**
   * Default Constructor
   * @param options App Name
   */
  constructor(
    options: CoreKernelProps & {
      apiVersion?: number;
      portOverride?: number;
    },
  ) {
    super({ ...options });
    this.metric = null;
    this.apiVersion = options.apiVersion ?? 1;
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
          this,
        ),
      );
    }
  }

  getAppServerPort(): number {
    return this.expressPort;
  }

  setAppServerPort(port: number): void {
    this.expressPort = port;
  }

  getApiVersion(): number {
    return this.apiVersion;
  }

  getMetric() {
    return this.metric;
  }
}
