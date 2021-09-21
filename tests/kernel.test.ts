import {
  BaseAuthProvider, BaseDBUpdate,
  BaseKernelModule,
  BaseLoopService, cors,
  createFolderIfNotExist, DBConnection, IBaseKernelModule, ICClient, IKernel, KernelEndpoint,
  sleep, SQLightConnector
} from '../src';
import { config } from 'dotenv';
import * as Path from 'path';
import Kernel from '../src/Kernel';
 import BaseClient from "../src/classes/BaseClient";
import {JwtToken} from "../src/classes/BaseAuthProvider";
import axios from 'axios';
import BaseRedisCache from '../src/modules/cache/BaseRedisCache';
import { Request } from 'express';
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

  cc:ICClient
  constructor(cc:ICClient) {
    super();
    this.cc=cc;
  }
  async authorizeToken(username: string, token: any, requestType: string): Promise<boolean> {
    return username ==='admin' && token ==='admin' && requestType ==='api';
  }

  async validateAcces(token: JwtToken, requestType: string): Promise<boolean> {
    return token.username==="admin" && requestType === "api";
  }

  async bearerTokenValidation(req: Request): Promise<JwtToken | null> {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      if (token == null) {
      return null;
    }
    const tokenData = await this.cc.jwtVerifyAccessToken(token);
    if (tokenData) {
      return tokenData;
    }
    return null;
  }

}

class TestClient extends BaseClient{

}


class TestDB extends SQLightConnector{
  constructor(module:IBaseKernelModule<any, any, any, any>) {
    super(module,"1");
  }
  async initNewDB(): Promise<void> {
    await this.execScripts([])
  }
}


class TestDBUpdate extends BaseDBUpdate<any>{
  constructor(db:DBConnection<any>) {
    super("0","1",db);
  }
  async performe(): Promise<boolean> {
    const db=this.getDb();

    await db.execScripts([
      { exec: `UPDATE ${db.schemaName}.config SET c_value=1 WHERE c_key='dbversion'` ,param:[]}
    ])
    return true;
  }

}
class TestRedisCache extends BaseRedisCache{}
class TestModuel extends BaseKernelModule<TestDB,TestClient,TestRedisCache, null>{
  constructor(kernel:IKernel) {
    super("testModule",kernel);
  }
  async initModule(): Promise<void> {
    this.setClient(new TestClient("testc",this))
    this.setCache(new TestRedisCache("testcache",this))
    this.log("FirstTHIS")
    const db=new TestDB(this)
    this.setDb(db)
    db.setUpdateChain(new TestDBUpdate(this.getDb() as DBConnection<any>))
  }

  startup(): Promise<void> {
    return Promise.resolve( undefined );
  }

  beforeServiceStart(): Promise<void> {
    return Promise.resolve( undefined );
  }

  final(): Promise<void> {
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

  beforeServiceStart(): Promise<void> {
    return Promise.resolve( undefined );
  }

  final(): Promise<void> {
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
    kernel.setTrigerFunction("load",async (ik)=>{
      const ep=ik.getModule().getEndpoint() as KernelEndpoint;
      ep.getApp().use(cors)
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
    expect(conf?.c_value).not.toBeNull();
  });

  test('get testdb version', async () => {
    const db = kernel.getModuleList()[0].getDb();
    const conf = await db?.getConfig('dbversion');
    expect(conf?.c_value).not.toBeNull();
  });

  test('redis test', async () => {
    const cache = kernel.getModuleList()[0].getCache() as BaseRedisCache;
    const obj={
      test:"object",
    }
    const kk='dbversion'
    const kk2='test'
    await cache.clearAll();
    expect(await cache.exist(kk)).toBeFalsy()
    await cache.set(kk,"001");
    expect( await cache.get(kk)).toBe("001")
    expect(await cache.exist(kk)).toBeTruthy()
    await cache.set(kk2,JSON.stringify(obj));
    await cache.expire(kk,30);
    const a=await cache.get(kk2);
    expect(a).not.toBeUndefined()
    expect(a).not.toBeNull()
    if (!a){
      return
    }
    expect(JSON.parse(a)?.test).toBe("object")
    await cache.expire(kk2,30);
  });
  test('test bridge', async () => {
    const mod = kernel.getModuleList()[1];

    expect(mod.getBridgeModule("testModule")).not.toBeUndefined();
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

    const token= await axios.post(`http://localhost:${port}/token`,{
      username: "admin",
      token: process.env.SERVER_PASSWOR,
    })

    expect(token.status).toBe(200);

    expect(token.data).not.toBeNull();
    expect(token.data).not.toBeUndefined();
    jwtToken=token.data.token;
    const res = await cc?.jwtVerifyAccessToken(jwtToken);
    expect(await cc?.permissonValidation(jwtToken,"api")).not.toBeTruthy()
    expect(res?.username).toBe("admin");

  });

  test("get token no body",async ()=>{

    try {
      const response = await axios.post(
        `http://localhost:${port}/token`
      );

    }catch (error:any) {
      expect(error.response.status).toBe(400);
    }

  });


  test("get token no user",async ()=>{
    try {
      const response = await axios.post(`http://localhost:${port}/token`, { token: process.env.SERVER_PASSWOR } );
    }catch (e:any){
      expect(e.response.status).toBe(401);
    }

  });


  test("get token wrong user",async ()=>{
    try {
      const response = await axios.post( `http://localhost:${port}/token`, { token: process.env.SERVER_PASSWOR, user:"noAdmin" } );
    }catch (e:any){
      expect(e.response.status).toBe(401);
    }


  });

  test("get token wrong token",async ()=>{
    try {
      const response = await axios.post( `http://localhost:${port}/token`, { token: testText, username: "testUser", } );
    }catch (e:any){
      expect(e.response.status).toBe(403);
    }

  });


  test("auth provider",async ()=>{
    const cc=kernel.getCryptoClient();
    expect(cc).not.toBeNull();

    const prov=cc?.setAuthProvider(new TestAuthProvider(cc))

     expect(prov).toBeTruthy()


    const testcall = await axios.post( `http://localhost:${port}/token`, { token: "admin", username: "admin", } );
    expect(testcall.status).toBe(200);

    const adminToken=await cc?.jwtVerifyAccessToken(testcall.data.token)
    expect(adminToken).not.toBeNull();

    if (adminToken){
      expect(await cc?.permissonValidation(adminToken,"api")).toBeTruthy()
    }

  });




  test("test api auth fail",async ()=>{

    try {
      const response = await axios.get( `http://localhost:${port}/test/auth` );
    }catch (e:any){
      expect(e.response.status).toBe(401);
    }

  });



  test("test auth ",async ()=>{
    const testcall = await axios.get( `http://localhost:${port}/test/auth`,{ headers:{ Authorization:`bearer ${jwtToken}` } } );
    expect(testcall.status).toBe(200);
  });


  test('test api version', async () => {
    const version = await axios.get(`http://localhost:${port}/version`);
    expect(version.status).toBe(200);
    expect(version.data.api).toBe(1);
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

