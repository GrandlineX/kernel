import Timeout = NodeJS.Timeout;
import BaseService from './BaseService';
import { IBaseKernelModule } from '../lib';
import { sleep } from '../utils';

export default abstract class BaseLoopService extends BaseService {
  interval: Timeout | null;

  timeOut: number;

  constructor(
    name: string,
    timeout: number,
    module: IBaseKernelModule<any, any, any, any>
  ) {
    super(name, module);
    this.interval = null;
    this.timeOut = timeout;
    this.startUp = this.startUp.bind(this);
  }

  async start(): Promise<any> {
    if (this.state === 'INIT') {
      this.setRunning();
      this.interval = setTimeout(this.startUp, 0);
    } else if (!this.forceStop) {
      this.debug(this.state);
      this.interval = setTimeout(this.startUp, this.timeOut);
    }
  }

  async startUp(): Promise<any> {
    if (!this.forceStop) {
      this.setRunning();
      this.debug(this.state);
      await this.loop();
    } else {
      this.setSleeping();
    }
  }

  async next(): Promise<any> {
    this.setSleeping();
    await this.start();
  }

  async stop(): Promise<any> {
    this.log('try to stop service');
    this.forceStop = true;
    this.debug('ForceStop');
    if (this.state === 'INIT') {
      this.debug('Service Exit 0');
    } else if (this.interval && this.state === 'SLEEPING') {
      clearInterval(this.interval);
      this.debug('Service Exit');
    } else {
      await sleep(1000);
      await this.stop();
    }
  }

  setRunning() {
    if (!this.forceStop) {
      this.state = 'RUNNING';
    }
  }

  setSleeping() {
    this.state = 'SLEEPING';
  }

  abstract loop(): Promise<void>;
}
