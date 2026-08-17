import e from 'express';
import BaseEndpoint from '../classes/BaseEndpoint';
import type { GLXMiddleWare } from '../modules/crypto';

export default class KernelEndpoint extends BaseEndpoint {
  registerStaticFolder(staticPath: string) {
    this.registerMiddleWare(e.static(staticPath));
  }

  registerMiddleWare(mw: GLXMiddleWare) {
    this.getApp().use(mw);
  }
}
