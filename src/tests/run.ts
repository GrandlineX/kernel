import { XUtil } from '@grandlinex/core';
import Kernel from '../Kernel.js';

const apiPort = 9257;

const [testPath] = XUtil.setupEnvironment(
  [process.cwd()],
  ['data', 'config'],
);

const appName = 'TestKernel';
const kernel = new Kernel({
  appName: appName.toUpperCase(),
  appCode: appName.toLowerCase(),
  pathOverride: testPath,
  portOverride: apiPort,
  envFilePath: process.cwd(),
});
kernel.start();
