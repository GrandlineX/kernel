import { Swagger, SwaggerClient, SwaggerUtil } from '@grandlinex/swagger-mate';
import Kernel from '../src/Kernel.js';

@Swagger({
  info: {
    title: 'SwaggerKernel',
    version: '0.0.0',
  },
  openapi: '3.0.3',
  paths: {},
  security: [
    {
      bearerAuth: [],
    },
  ],
  servers: [
    {
      url: 'http://localhost:9257',
      description: 'LocalDev',
    },
  ],
})
class SwaggerKernel extends Kernel {
  constructor() {
    super({
      appName: 'TestKernel',
      appCode: 'testkernel',
      portOverride: 9257,
      envFilePath: process.cwd(),
    });
  }
}

function SwaggerTest() {
  const kernel = new SwaggerKernel();
  const conf = SwaggerUtil.metaExtractor(
    kernel,
    true,
    ...kernel.getActionList(true),
  );

  if (conf) {
    SwaggerUtil.writeMeta(conf, 'JSON');
    SwaggerClient.genAPICConnector({
      conf,
      name: `dev-con`,
      version: '0.0.0',
    });
  } else {
    throw new Error('No config found!');
  }
}

SwaggerTest();
