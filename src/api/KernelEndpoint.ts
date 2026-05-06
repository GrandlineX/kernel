import e from 'express';
import BaseEndpoint from '../classes/BaseEndpoint.js';
import { GLXMiddleWare } from '../modules/crypto/index.js';

export default class KernelEndpoint extends BaseEndpoint {
  registerStaticFolder(staticPath: string) {
    this.registerMiddleWare(e.static(staticPath));
  }

  registerMiddleWare(mw: GLXMiddleWare) {
    this.getApp().use(mw);
  }
}
