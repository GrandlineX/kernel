import { BridgeState, IBaseBrige, IBaseKernelModule } from '../lib';
import { sleep } from '../utils/envUtil';
import { Logger } from '../modules';

export default class BaseBridge extends Logger implements IBaseBrige {
  private state: BridgeState;

  private src: IBaseKernelModule<any, any, any, any>;

  private target: IBaseKernelModule<any, any, any, any>;

  constructor(
    src: IBaseKernelModule<any, any, any, any>,
    target: IBaseKernelModule<any, any, any, any>
  ) {
    super(
      `BR:${src.getName()} => ${target.getName()}`,
      src.getKernel().getGlobalConfig().dir.temp
    );
    this.src = src;
    this.target = target;
    this.state = BridgeState.init;
  }

  connect(): void {
    this.src.addSrcBridge(this);
    this.target.addTarBridge(this);
    this.debug('connected');
  }

  setState(state: BridgeState): void {
    this.state = state;
  }

  async waitForState(state: BridgeState): Promise<boolean> {
    while (this.state !== state) {
      await sleep(1000);
    }
    return true;
  }

  async getTarget(): Promise<IBaseKernelModule<any, any, any, any>> {
    return this.target;
  }
}
