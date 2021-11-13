import {
  KernelEndpoint, KernelModule
} from '../src';
import * as Path from 'path';
import axios from 'axios';
import {
   createFolderIfNotExist,
   sleep,
 } from '@grandlinex/core';
import { cors } from '../src';
import { TestAuthProvider, testKernelUtil } from './DebugClasses';



const msiPath = Path.join(__dirname, '..', 'data');
const testPath = Path.join(__dirname, '..', 'data', 'config');
 process.env.DLOG_LEVEL = 'debug';


 createFolderIfNotExist(msiPath);
 createFolderIfNotExist(testPath);


let port = 9901;
let kernel = testKernelUtil("KLight",port);

const testText = 'hello_world';

describe('Clean Startup Light', () => {
  let jwtToken:any;
  test('definePreload', async () => {
    expect(kernel.getState()).toBe('init');
    expect(kernel.getModCount()).toBe(0);
    kernel.setTriggerFunction("pre",async (ik)=>{
      const mod=ik.getModule() as KernelModule
      mod.useLightDB=true;
    })
    kernel.setTriggerFunction("load",async (ik)=>{
      const ep=ik.getModule().getEndpoint() as KernelEndpoint;
      ep.getApp().use(cors)
    })
  });
  test('start kernel', async () => {
    const result = await kernel.start();
    expect(result).toBe(true);
    expect(kernel.getModCount()).toBe(0);
    expect(kernel.getState()).toBe('running');
  });

  test('get db version', async () => {
    expect(kernel.getState()).toBe('running');
    const db = kernel.getDb();
    const conf = await db?.getConfig('dbversion');
    expect(conf?.c_value).not.toBeNull();
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
    await db?.removeConfig(testText);
    const res2 = await db?.getConfig(testText);
    expect(res2).toBeUndefined();

    const exeres = await db?.execScripts([
      {
        exec: `INSERT INTO ${db.schemaName}.config VALUES (?,?)`,
        param: ['test', 'test'],
      },
      {
        exec: `DELETE FROM ${db.schemaName}.config WHERE c_key=?`,
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
    const store=kernel.getConfigStore();
    const dat={
      username: "admin",
      token: store.get("SERVER_PASSWORD"),
    }
    const token= await axios.post<{token:string}>(`http://localhost:${port}/token`,dat)

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
    const store=kernel.getConfigStore();
    try {
      const response = await axios.post(`http://localhost:${port}/token`, { token: store.get("SERVER_PASSWORD") } );
    }catch (e:any){
      expect(e.response.status).toBe(401);
    }

  });


  test("get token wrong user",async ()=>{
    const store=kernel.getConfigStore();

    try {
      const response = await axios.post( `http://localhost:${port}/token`, { token: store.get("SERVER_PASSWORD"), user:"noAdmin" } );
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


    const testcall = await axios.post<{token:string}>( `http://localhost:${port}/token`, { token: "admin", username: "admin", } );
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
    const version = await axios.get<{api:number}>(`http://localhost:${port}/version`);
    expect(version.status).toBe(200);
    expect(version.data.api).toBe(1);
  });


  test('exit kernel', async () => {
    const result = await kernel.stop();

    await sleep(1000);

    expect(kernel.getState()).toBe('exited');

    expect(result).toBeTruthy();
  });
});

