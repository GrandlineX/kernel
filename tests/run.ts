// @ts-ignore
import Path from 'path';
import { config } from 'dotenv';
import Kernel, {createFolderIfNotExist, KernelEndpoint} from "../src";
// @ts-ignore
import cors from "cors";

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
    app.use(cors())
})


kernel.start();
