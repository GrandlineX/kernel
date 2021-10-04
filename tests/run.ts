import * as Path from 'path';
import { config } from 'dotenv';
import Kernel, {  KernelEndpoint } from '../src';
import { createFolderIfNotExist } from '@grandlinex/core';
import { cors } from '../src/modules/crypto/utils/cors';

config();

const appName = 'TestKernel';
const appCode = 'tkernel';
const testPathData = Path.join(__dirname, '..', 'data');
const testPath = Path.join(__dirname, '..', 'data', 'config');

const apiPort = 9257;

createFolderIfNotExist(testPathData);
createFolderIfNotExist(testPath);

const kernel = new Kernel(appName, appCode, testPath, apiPort);
kernel.setTrigerFunction("load",async (ik)=>{
    const endpoint=ik.getModule().getEndpoint() as KernelEndpoint
    const app=endpoint.getApp();
     app.use(cors)
})


kernel.start();
