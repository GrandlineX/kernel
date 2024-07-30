import { XUtil } from '@grandlinex/core';
import * as url from 'url';
import Kernel from '../Kernel.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const apiPort = 9257;

const [testPath] = XUtil.setupEnvironment(
  [__dirname, '..'],
  ['data', 'config'],
);

const appName = 'TestKernel';
const kernel = new Kernel({
  appName: appName.toUpperCase(),
  appCode: appName.toLowerCase(),
  pathOverride: testPath,
  portOverride: apiPort,
  envFilePath: __dirname,
});
kernel.start();
