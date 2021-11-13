import * as Path from 'path';
import { createFolderIfNotExist } from '@grandlinex/core';
import { testKernelUtil } from './DebugClasses';

const testPathData = Path.join(__dirname, '..', 'data');
const testPath = Path.join(__dirname, '..', 'data', 'config');

const apiPort = 9257;

createFolderIfNotExist(testPathData);
createFolderIfNotExist(testPath);

const kernel =testKernelUtil("TestRun",apiPort)


kernel.start();
