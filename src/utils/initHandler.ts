import { IBaseKernelModule } from '../lib';
import { ILogger } from '../modules/logger/Logger';
import BaseBridge from '../classes/BaseBridge';

export default async function initHandler(
  modList: IBaseKernelModule<any, any, any, any>[],
  logger: ILogger
): Promise<void> {
  modList.forEach((src) => {
    src.getDependencyList().forEach((dep) => {
      const tar = modList.find((mod) => mod.getName() === dep);
      if (tar) {
        const bridge = new BaseBridge(src, tar);
        bridge.connect();
      } else {
        logger.error(`DEPENDING MOD NOT FOUND: ${dep}`);
        process.exit(4);
      }
    });
  });

  const workload: Promise<any>[] = [];
  modList.forEach((action) => {
    workload.push(action.register());
  });

  await Promise.all(workload);
  const workloadStart: Promise<any>[] = [];
  modList.forEach((action) => {
    if (action?.start) {
      workloadStart.push(action.start());
    }
  });
  await Promise.all(workloadStart);
}
