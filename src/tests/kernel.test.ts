import axios from 'axios';
import {
  JestLib,
  setupDevKernel,
  TestContext,
  XUtil
} from '@grandlinex/core';
import {
  KernelEndpoint,
  KernelModule,
  cors,
  Kernel,
  ActionTypes,
  CryptoClient
} from '../index.js';

import { TestAuthProvider, TestAllAction } from './DebugClasses.js';

const [testPath] =XUtil.setupEnvironment([__dirname,'..'],['data','config'])

process.env.DLOG_LEVEL = 'debug';


const port = 9900;
const appName = 'TestKernel';
const kernel = new Kernel({
  appName: appName.toUpperCase(),
  appCode: appName.toLowerCase(),
  pathOverride: testPath,
  portOverride: port,
  envFilePath: __dirname,
});

setupDevKernel<Kernel>(kernel);

kernel.setBaseModule(new KernelModule(kernel));

const mod = kernel.getModule();

// eslint-disable-next-line @typescript-eslint/ban-types
const types: [ActionTypes, Function][] = [
  ['POST', axios.post],
  ['GET', axios.get],
  ['PATCH', axios.patch],
  ['DELETE', axios.delete],
];

types.forEach(([type]) => {
  mod.addAction(new TestAllAction(mod, type));
});

kernel.setCryptoClient(new CryptoClient(CryptoClient.fromPW('testpw'), kernel));

TestContext.getEntity({ kernel, cleanUpPath: testPath });

kernel.setTriggerFunction('load', async (ik) => {
  const ep = ik.getModule().getPresenter() as KernelEndpoint;
  ep.getApp().use(cors);
});

const testText = 'hello_world';

// Start
JestLib.jestStart();
JestLib.jestCore();
JestLib.jestStore();


// Api Tests
describe('Express-Kernel', () => {
  let jwtToken: any;

  test('dev mode', async () => {
    kernel.setDevMode(true);
  });
  test('crypto jwt', async () => {
    const cc = kernel.getCryptoClient();
    expect(cc).not.toBeNull();

    const token = await cc!.jwtGenerateAccessToken({ username: testText, userid:testText });

    expect(token).not.toBeUndefined();
    if (token) {
      const res = await cc!.jwtVerifyAccessToken(token);
      expect(typeof res ==="number").toBeFalsy();
      if (typeof res !=="number"){
        expect(res?.username).toBe(testText);
      }

    }
  });

  test('get api toke', async () => {
    const cc = kernel.getCryptoClient();
    expect(cc).not.toBeNull();
    const store = kernel.getConfigStore();
    const token = await axios.post<{ token: string }>(
      `http://localhost:${port}/token`,
      {
        username: 'admin',
        token: store.get('SERVER_PASSWORD'),
      }
    );

    expect(token.status).toBe(200);

    expect(token.data).not.toBeNull();
    expect(token.data).not.toBeUndefined();
    jwtToken = token.data.token;
    const res = await cc!.jwtVerifyAccessToken(jwtToken);
    expect(await cc?.permissionValidation(jwtToken, 'api')).not.toBeTruthy();
    expect(typeof res ==="number").toBeFalsy();
    if (typeof res!=="number"){
      expect(res.username).toBe('admin');
    }
  });

  test('get token no body', async () => {
    try {
      await axios.post(`http://localhost:${port}/token`);
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });

  test('get token no user', async () => {
    const store = kernel.getConfigStore();
    try {
      const response = await axios.post(`http://localhost:${port}/token`, {
        token: store.get('SERVER_PASSWORD'),
      });
    } catch (e: any) {
      expect(e.response.status).toBe(401);
    }
  });

  test('get token wrong user', async () => {
    const store = kernel.getConfigStore();
    try {
      const response = await axios.post(`http://localhost:${port}/token`, {
        token: store.get('SERVER_PASSWORD'),
        user: 'noAdmin',
      });
    } catch (e: any) {
      expect(e.response.status).toBe(401);
    }
  });

  test('get token wrong token', async () => {
    try {
      const response = await axios.post(`http://localhost:${port}/token`, {
        token: testText,
        username: 'testUser',
      });
    } catch (e: any) {
      expect(e.response.status).toBe(403);
    }
  });

  test('auth provider', async () => {
    const cc = kernel.getCryptoClient();
    expect(cc).not.toBeNull();

    const prov = cc?.setAuthProvider(new TestAuthProvider(cc));

    expect(prov).toBeTruthy();

    const testcall = await axios.post<{ token: string }>(
      `http://localhost:${port}/token`,
      { token: 'admin', username: 'admin' }
    );
    expect(testcall.status).toBe(200);

    const adminToken = await cc!.jwtVerifyAccessToken(testcall.data.token);
    expect(adminToken).not.toBeNull();

    if (typeof  adminToken !=="number") {
      expect(await cc?.permissionValidation(adminToken, 'api')).toBeTruthy();
    }
  });

  test('test api auth fail', async () => {
    try {
      const response = await axios.get(`http://localhost:${port}/test/auth`);
    } catch (e: any) {
      expect(e.response.status).toBe(401);
    }
  });

  test('test auth ', async () => {
    const testcall = await axios.get(`http://localhost:${port}/test/auth`, {
      headers: { Authorization: `bearer ${jwtToken}` },
    });
    expect(testcall.status).toBe(200);
  });

  test('test token extra', async () => {
    const token = await kernel.getCryptoClient()!.jwtGenerateAccessToken({ username: testText, userid:testText },0);
    const valid = kernel.getCryptoClient()!.jwtDecodeAccessToken(token);
    expect(valid?.username).toBe(testText);
    expect(valid?.test).toBe("test");
  });
  test('test auth expire', async () => {
    const token = await kernel.getCryptoClient()!.jwtGenerateAccessToken({ username: testText, userid:testText },0);
    const valid = kernel.getCryptoClient()!.jwtDecodeAccessToken(token);
    expect(valid?.username).toBe(testText);

    await XUtil.sleep(2000);
    const testcall = await axios.get(`http://localhost:${port}/test/auth`, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus:()=>true
    });
    expect(testcall.status).toBe(498);
  },30000);

  // eslint-disable-next-line @typescript-eslint/ban-types
  test.each(types)('Type (%s):', async (type, fc: Function) => {
    let testcall;
    const qPath = `http://localhost:${port}/testpath`;
    const conf = {
      headers: { Authorization: `bearer ${jwtToken}` },
    };
    if (type === 'GET' || type === 'DELETE') {
      testcall = await fc(qPath, conf);
    } else {
      testcall = await fc(qPath, { test: "value" }, conf);
    }
    expect(testcall.status).toBe(200);
  });

  test('test api version', async () => {
    const version = await axios.get<{ api: number }>(
      `http://localhost:${port}/version`
    );
    expect(version.status).toBe(200);
    expect(version.data.api).toBe(1);
  });
});

// Ending
JestLib.jestEnd();
JestLib.jestOrm();
