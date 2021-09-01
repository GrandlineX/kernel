import fetch, { RequestInit } from 'node-fetch';
import {
  BaseAuthProvider,
  BaseKernelModule,
  BaseLoopService,
  createFolderIfNotExist, IKernel,
  removeFolderIfNotExist,
  sleep
} from '../src';
import { config } from 'dotenv';
import * as Path from 'path';
import Kernel from '../src/Kernel';
 import BaseClient from "../src/classes/BaseClient";
import {JwtToken} from "../src/classes/BaseAuthProvider";
config();

const appName = 'TestKernel';
const appCode = 'tkernel';
const msiPath = Path.join(__dirname, '..', 'data');
const testPath = Path.join(__dirname, '..', 'data', 'config');
 process.env.DLOG_LEVEL = 'debug';

function testKernelUtil(port: number) {
   return  new Kernel(appName, appCode, testPath, port);
}

function randomString(length:number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
  }
  return result;
}


class TestServie extends BaseLoopService{
  async loop(): Promise<void> {

    await sleep(2000)
    await this.next()
  }
}

class TestAuthProvider extends  BaseAuthProvider{
  async authorizeToken(username: string, token: any, requestType: string): Promise<boolean> {
    return username ==='admin' && token ==='admin' && requestType ==='api';
  }

  async validateAcces(token: JwtToken, requestType: string): Promise<boolean> {
    return token.username==="admin" && requestType === "api";
  }

}

class TestClient extends BaseClient{

}

class TestModuel extends BaseKernelModule<null,TestClient,null, null>{
  constructor(kernel:IKernel) {
    super("testModule",kernel);
  }
  initModule(): Promise<void> {
    this.setClient(new TestClient("testc",this))
    this.log("FirstTHIS")
    return Promise.resolve( undefined );
  }

  startup(): Promise<void> {
    return Promise.resolve( undefined );
  }

}
class BridgeTestModule extends BaseKernelModule<null,TestClient,null, null>{
  constructor(kernel:IKernel) {
    super("bridgeModule",kernel,"testModule");
  }
  initModule(): Promise<void> {
    this.log("LaterTHIS")
    return Promise.resolve( undefined );
  }

  startup(): Promise<void> {
    return Promise.resolve( undefined );
  }

}

 createFolderIfNotExist(msiPath);
 createFolderIfNotExist(testPath);


let port = 9900;
let kernel = testKernelUtil(port);

const testText = 'hello_world';

describe('Clean Startup', () => {
  let jwtToken:any;
  test('definePreload', async () => {
    expect(kernel.getState()).toBe('init');
    expect(kernel.getModuleList()).toHaveLength(0);
    kernel.setTrigerFunction("pre",async (ik)=>{
      ik.addModule(new TestModuel(ik))
      ik.addModule(new BridgeTestModule(ik))
    })
  });
  test('start kernel', async () => {
    const result = await kernel.start();
    expect(result).toBe(true);
    expect(kernel.getModuleList()).toHaveLength(2);
    expect(kernel.getState()).toBe('running');
  });

  test('get db version', async () => {
    expect(kernel.getState()).toBe('running');
    const db = kernel.getDb();
    const conf = await db?.getConfig('dbversion');
    expect(conf?.c_value).toBe('0');
  });


    test('keystore', async () => {
      const text=testText;
      const cc = kernel.getCryptoClient();
      expect(cc).not.toBeNull();
      if (cc) {
        const keyID = await cc.keyStoreSave(text);
        const keyreturn = await cc.keyStoreLoad(keyID);
        expect(keyreturn).toBe(text);
      }
    });


  test('db function', async () => {
    expect(kernel.getState()).toBe('running');
    const db = kernel.getDb();
    const conf = await db?.setConfig(testText, testText);
    expect(conf).toBeTruthy();
    const res = await db?.getConfig(testText);
    expect(res?.c_value).toBe(testText);
    db?.removeConfig(testText);
    const res2 = await db?.getConfig(testText);
    expect(res2).toBeUndefined();

    const exeres = await db?.execScripts([
      {
        exec: 'INSERT INTO kernel.config VALUES ($1,$2)',
        param: ['test', 'test'],
      },
      {
        exec: 'DELETE FROM kernel.config WHERE c_key=$1',
        param: ['test'],
      },
    ]);
    expect(exeres?.length).toBe(2);
  });

  test('crypto', async () => {
    const cc = kernel.getCryptoClient();
    expect(cc).not.toBeNull();
    const enc = cc?.encrypt(testText);
    expect(enc).not.toBeUndefined();
    if (enc) {
      const dev = cc?.decrypt(enc.enc, enc.iv, enc.auth);
      expect(dev).toBe(testText);
      expect(await cc?.generateSecureToken(48)).not.toBe("")
    }
  });

  test('crypto jwt', async () => {
    const cc = kernel.getCryptoClient();
    expect(cc).not.toBeNull();

    const token = cc?.jwtGenerateAccessToken({ username: testText });

    expect(token).not.toBeUndefined();
    if (token) {
      const res = await cc?.jwtVerifyAccessToken(token);
      expect(res?.username).toBe(testText);
    }
  });

  test('get api toke', async () => {
    const cc = kernel.getCryptoClient();
    expect(cc).not.toBeNull();
    const body: string = JSON.stringify({
      username: "admin",
      token: process.env.SERVER_PASSWOR,
    });
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: [['Content-Type', 'application/json']],
      redirect: 'follow',
      body,
    };
    const token = await fetch(`http://localhost:${port}/token`, requestOptions);
    expect(token.status).toBe(200);
    const text = await token.text();
    const json = JSON.parse(text);
    expect(json.token).not.toBeNull();
    expect(json.token).not.toBeUndefined();
    jwtToken=json.token;
    const res = await cc?.jwtVerifyAccessToken(json.token);
    expect(await cc?.permissonValidation(jwtToken,"api")).not.toBeTruthy()
    expect(res?.username).toBe("admin");

  });

  test("get token no body",async ()=>{
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: [['Content-Type', 'application/json']],
      redirect: 'follow',
    };
    const testcall = await fetch(
        `http://localhost:${port}/token`,
        requestOptions
    );
    expect(testcall.status).toBe(400);
  });


  test("get token no user",async ()=>{
    const body: string = JSON.stringify({
      token: process.env.SERVER_PASSWOR,
    });
     const requestOptions: RequestInit = {
      method: 'POST',
      redirect: 'follow',
      headers: [['Content-Type', 'application/json']],
      body:body
    };
    const testcall = await fetch(
        `http://localhost:${port}/token`,
        requestOptions
    );
    expect(testcall.status).toBe(401);
  });


  test("get token wrong user",async ()=>{
    const body: string = JSON.stringify({
      token: process.env.SERVER_PASSWOR,
      user:"noAdmin"
    });
    const requestOptions: RequestInit = {
      method: 'POST',
      redirect: 'follow',
      headers: [['Content-Type', 'application/json']],
      body:body
    };
    const testcall = await fetch(
        `http://localhost:${port}/token`,
        requestOptions
    );
    expect(testcall.status).toBe(401);
  });

  test("get token wrong token",async ()=>{
    const body: string = JSON.stringify({
      token: testText,
      username: "testUser",
    });
     const requestOptions: RequestInit = {
      method: 'POST',
      redirect: 'follow',
      headers: [['Content-Type', 'application/json']],
      body:body
    };
    const testcall = await fetch(
        `http://localhost:${port}/token`,
        requestOptions
    );
    expect(testcall.status).toBe(403);
  });


  test("auth provider",async ()=>{
    const cc=kernel.getCryptoClient();
    expect(cc).not.toBeNull();

    const prov=cc?.setAuthProvider(new TestAuthProvider())

     expect(prov).toBeTruthy()

    const body: string = JSON.stringify({
      token: "admin",
      username: "admin",
    });
    const requestOptions: RequestInit = {
      method: 'POST',
      redirect: 'follow',
      headers: [['Content-Type', 'application/json']],
      body:body
    };
    const testcall = await fetch(
        `http://localhost:${port}/token`,
        requestOptions
    );
    expect(testcall.status).toBe(200);
    const text=await testcall.text()
    const json= JSON.parse(text);

    const adminToken=await cc?.jwtVerifyAccessToken(json.token)
    expect(adminToken).not.toBeNull();

    if (adminToken){
      expect(await cc?.permissonValidation(adminToken,"api")).toBeTruthy()
    }

  });




  test("test api auth fail",async ()=>{
    const requestOptions: RequestInit = {
      method: 'GET',
      redirect: 'follow',
    };

    const testcall = await fetch(
        `http://localhost:${port}/test/auth`,
        requestOptions
    );
    expect(testcall.status).toBe(401);
  });



  test("test auth ",async ()=>{
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: [['Authorization', `bearer ${jwtToken}`]],
      redirect: 'follow',
    };
    const testcall = await fetch(
        `http://localhost:${port}/test/auth`,
        requestOptions
    );
    expect(testcall.status).toBe(200);
  });


  test('test api version', async () => {
    const version = await fetch(`http://localhost:${port}/version`);
    expect(version.status).toBe(200);
    const res = await version.text();
    const resObj = JSON.parse(res);
    expect(resObj?.api).toBe(1);
  });


  test('loop service test', async () => {
    const mod=kernel.getModule()
    const service=new TestServie("hello",30000,mod);
    expect(service.state).toBe("INIT")
    service.setRunning()
    expect(service.state).toBe("RUNNING")
    service.setSleeping()
    expect(service.state).toBe("SLEEPING")
    service.forceStop=true;
    service.setRunning()
    expect(service.state).toBe("SLEEPING")
  });

  test('loop service test', async () => {
    const mod=kernel.getModule()
    const service=new TestServie("hello",30000,mod);
      mod.addService(service)
    await service.start()

    await sleep( 1 )

    expect(service.state).toBe("RUNNING")

    await service.stop()

    expect(service.state).toBe("SLEEPING")

  });



  test('exit kernel', async () => {
    const result = await kernel.stop();

    await sleep(1000);

    expect(kernel.getState()).toBe('exited');

    expect(result).toBeTruthy();
  });
});

