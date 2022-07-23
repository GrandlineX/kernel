import { XUtil } from '@grandlinex/core';
import { Kernel } from '../src';

const apiPort = 9257;

const [testPath] =XUtil.setupEnvironment([__dirname,'..'],['data','config'])

const appName = 'TestKernel';
const kernel = new Kernel({
  appName: appName.toUpperCase(),
  appCode: appName.toLowerCase(),
  pathOverride: testPath,
  portOverride: apiPort,
  envFilePath: __dirname,
});
kernel.start();
