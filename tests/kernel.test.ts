import { describe, test, expect } from 'vitest';
import axios from 'axios';
import { XUtil } from '@grandlinex/core';
import { setupDevKernel, TestContext, TestLib } from '@grandlinex/core/dev';

import {
  type ActionTypes,
  cors,
  CryptoClient,
  Kernel,
  KernelEndpoint,
  KernelModule,
} from '../src/index.js';

import { TestAllAction, TestCryptoClient } from './DebugClasses.js';

process.env.DLOG_LEVEL = 'debug';

const port = 9900;
const appName = 'TestKernel';
const kernel = new Kernel({
  appName: appName.toUpperCase(),
  appCode: appName.toLowerCase(),
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

TestContext.getEntity({ kernel, cleanUp: true });

kernel.on('load', async (ik) => {
  const ep = ik.getModule().getPresenter() as KernelEndpoint;
  ep.getApp().use(cors);
});

const testText = 'hello_world';

// Start
TestLib.testStart();
TestLib.testCore();
TestLib.testStore();

// Api Tests

describe.each([
  { text: 'CryptoClient', mode: 0 },
  { text: 'TestCryptoClient', mode: 1 },
])('Express-Kernel: $text', ({ mode }) => {
  let jwtToken: any;
  let jti: any;
  let jwtRefresh: any;

  test('Update CryptoClient', async () => {
    if (mode) {
      const store = kernel.getConfigStore();
      const cc = new TestCryptoClient(
        TestCryptoClient.fromPW(store.get('SERVER_PASSWORD')!),
        kernel,
      );
      kernel.setCryptoClient(cc);

      const testcall = await axios.post<{ token: string }>(
        `http://localhost:${port}/api/token`,
        { password: 'admin', username: 'admin' },
      );
      expect(testcall.status).toBe(200);

      const adminToken = await cc!.jwtVerifyAccessToken(testcall.data.token);
      expect(adminToken).not.toBeNull();

      if (typeof adminToken !== 'number') {
        expect(
          await cc?.permissionValidation({
            token: adminToken,
            requestType: ['api'],
          }),
        ).toBeTruthy();
      }
    }
  });

  test('dev mode', async () => {
    kernel.setDevMode(true);
  });
  test('crypto jwt', async () => {
    const cc = kernel.getCryptoClient();
    expect(cc).not.toBeNull();

    const data = await cc!.generateToken(testText, testText, false);

    expect(data.token).not.toBeUndefined();
    if (data.token) {
      const res = await cc!.jwtVerifyAccessToken(data.token);
      expect(typeof res === 'number').toBeFalsy();
      if (typeof res !== 'number') {
        expect(res?.username).toBe(testText);
      }
    }
    if (data.token) {
      const res = await cc!.jwtVerifyAccessToken(data.token);
      expect(typeof res === 'number').toBeFalsy();
      if (typeof res !== 'number') {
        expect(res?.username).toBe(testText);
      }
    }
  });

  test('get api token', async () => {
    const cc = kernel.getCryptoClient();
    expect(cc).not.toBeNull();
    const store = kernel.getConfigStore();
    const token = await axios.post<{ token: string; refresh?: string }>(
      `http://localhost:${port}/api/token`,
      {
        username: 'admin',
        password: mode ? 'admin' : store.get('SERVER_PASSWORD'),
      },
    );

    expect(token.status).toBe(200);

    expect(token.data).not.toBeNull();
    expect(token.data).not.toBeUndefined();
    jwtToken = token.data.token;
    if (mode) {
      expect(token.data.refresh).toBeUndefined();
    }
    const res = await cc!.jwtVerifyAccessToken(jwtToken);
    expect(typeof res === 'number').toBeFalsy();
    if (typeof res !== 'number') {
      expect(res.username).toBe('admin');
      expect(res.jti).toBeDefined();
      expect(res.sub).toBeDefined();
      expect(res.type).toBeDefined();
      expect(
        await cc!.permissionValidation({
          token: res,
          requestType: ['api'],
        }),
      ).toBe(!!mode);
    }
  });
  test('get api token with refresh', async () => {
    const cc = kernel.getCryptoClient();
    expect(cc).not.toBeNull();
    const store = kernel.getConfigStore();
    const token = await axios.post<{ token: string; refresh?: string }>(
      `http://localhost:${port}/api/token?refresh=true`,
      {
        username: 'admin',
        password: mode ? 'admin' : store.get('SERVER_PASSWORD'),
      },
    );

    expect(token.status).toBe(200);

    expect(token.data).not.toBeNull();
    expect(token.data).not.toBeUndefined();
    jwtToken = token.data.token;

    if (mode) {
      jwtRefresh = token.data.refresh;
      expect(jwtRefresh).toBeDefined();
    }
    const res = await cc!.jwtVerifyAccessToken(jwtToken);
    expect(
      await cc?.permissionValidation({
        token: jwtToken,
        requestType: ['api'],
      }),
    ).not.toBeTruthy();
    expect(typeof res === 'number').toBeFalsy();
    if (typeof res !== 'number') {
      expect(res.username).toBe('admin');
      expect(res.jti).toBeDefined();
      expect(res.sub).toBeDefined();
      expect(res.type).toBeDefined();
      jti = res.jti;
    }
  });

  test('get token no body', async () => {
    try {
      await axios.post(`http://localhost:${port}/api/token`);
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });

  test('get token no user', async () => {
    const store = kernel.getConfigStore();
    try {
      await axios.post(`http://localhost:${port}/api/token`, {
        password: store.get('SERVER_PASSWORD'),
      });
    } catch (e: any) {
      expect(e.response.status).toBe(400);
    }
  });

  test('get token wrong user', async () => {
    const store = kernel.getConfigStore();
    try {
      const req = await axios.post(`http://localhost:${port}/api/token`, {
        password: mode ? 'admin' : store.get('SERVER_PASSWORD'),
        username: 'noAdmin',
      });
      expect(req.status).not.toBe(200);
    } catch (e: any) {
      expect(e.response.status).toBe(403);
    }
  });

  test('get token wrong token', async () => {
    try {
      const req = await axios.post(`http://localhost:${port}/api/token`, {
        password: testText,
        username: 'testUser',
      });
      expect(req.status).not.toBe(200);
    } catch (e: any) {
      expect(e.response.status).toBe(403);
    }
  });

  test('test api auth fail', async () => {
    try {
      await axios.get(`http://localhost:${port}/api/auth/test`);
    } catch (e: any) {
      expect(e.response.status).toBe(401);
    }
  });

  test('test auth ', async () => {
    const testcall = await axios.get(`http://localhost:${port}/api/auth/test`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    expect(testcall.status).toBe(200);
  });
  test('test auth with refresh token ', async () => {
    if (mode) {
      try {
        await axios.get(`http://localhost:${port}/api/auth/test`, {
          headers: { Authorization: `Bearer ${jwtRefresh}` },
        });
      } catch (e: any) {
        expect(e.response.status).toBe(401);
      }
    }
  });
  test('test auth expire', async () => {
    const token = await kernel
      .getCryptoClient()!
      .jwtGenerateAccessToken(
        { username: testText, userid: testText, type: 'token', sid: 'test' },
        0,
      );
    const valid = kernel.getCryptoClient()!.jwtDecodeAccessToken(token);
    expect(valid?.username).toBe(testText);

    await XUtil.sleep(2000);
    const testcall = await axios.get(`http://localhost:${port}/api/auth/test`, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    });
    expect(testcall.status).toBe(498);
  }, 30000);

  // eslint-disable-next-line @typescript-eslint/ban-types
  test.each(types)('Type (%s):', async (type, fc: Function) => {
    let testcall;
    const qPath = `http://localhost:${port}/testpath`;
    const conf = {
      headers: { Authorization: `Bearer ${jwtToken}` },
    };
    if (type === 'GET' || type === 'DELETE') {
      testcall = await fc(qPath, conf);
    } else {
      testcall = await fc(qPath, { test: 'value' }, conf);
    }
    expect(testcall.status).toBe(200);
  });

  test('test api version', async () => {
    const version = await axios.get<{ api: number }>(
      `http://localhost:${port}/api/version`,
    );
    expect(version.status).toBe(200);
    expect(version.data.api).toBe(1);
  });
  test('get api refresh token', async () => {
    if (mode) {
      const cc = kernel.getCryptoClient();
      expect(cc).not.toBeNull();
      const token = await axios.post<{ token: string; refresh?: string }>(
        `http://localhost:${port}/api/token/refresh`,
        undefined,
        {
          headers: { Authorization: `Bearer ${jwtRefresh}` },
        },
      );
      expect(token.status).toBe(200);
      expect(token.data).not.toBeNull();
      expect(token.data).not.toBeUndefined();
      expect(token.data.token).toBeDefined();
      expect(token.data.refresh).toBeDefined();
      const res = await cc!.jwtVerifyAccessToken(token.data.token);
      expect(typeof res === 'number').toBeFalsy();
      if (typeof res !== 'number') {
        expect(res.username).toBe('admin');
        expect(res.jti).toBeDefined();
        expect(res.sub).toBeDefined();
        expect(res.type).toBeDefined();
        expect(res.jti).toBe(jti);
      }
    }
  });
});

// Ending
TestLib.testEnd();
