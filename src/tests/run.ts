import Kernel from '../Kernel.js';

const apiPort = 9257;


const appName = 'TestKernel';
const kernel = new Kernel({
  appName: appName.toUpperCase(),
  appCode: appName.toLowerCase(),
  portOverride: apiPort,
  envFilePath: process.cwd(),
});
kernel.start();
