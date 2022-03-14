import * as Path from 'path';
import { createFolderIfNotExist } from '@grandlinex/core';
import { Kernel } from '../src';

const testPathData = Path.join(__dirname, '..', 'data');
const testPath = Path.join(__dirname, '..', 'data', 'config');

const apiPort = 9257;

createFolderIfNotExist(testPathData);
createFolderIfNotExist(testPath);

const appName = 'TestKernel';
const kernel = new Kernel({
  appName: appName.toUpperCase(),
  appCode: appName.toLowerCase(),
  pathOverride: testPath,
  portOverride: apiPort,
  envFilePath: __dirname,
});
kernel.start();
