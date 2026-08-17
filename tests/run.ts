import Kernel from '../src/Kernel';
import { TestCryptoClient } from './DebugClasses';

const kernel = new Kernel({
  appName: 'TestKernel',
  appCode: 'testkernel',
  portOverride: 9257,
  envFilePath: process.cwd(),
});
kernel.setCryptoClient(
  new TestCryptoClient(TestCryptoClient.fromPW('pw'), kernel),
);
kernel.start();
