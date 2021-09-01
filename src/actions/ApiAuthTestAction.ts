import e from 'express';
import { IBaseKernelModule } from '../lib';
import { BaseApiAction } from '../classes';

/**
 * @name ApiAuthTestAction
 *
 * @openapi
 * /test/auth:
 *   get:
 *     summary: test call for valid access rights
 *     tags:
 *       - Kernel
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       401:
 *         description: invalid token / not authorized
 *
 */

export default class ApiAuthTestAction extends BaseApiAction {
  constructor(module: IBaseKernelModule<any, any, any, any>) {
    super('GET', '/test/auth', module);
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: e.Request,
    res: e.Response,
    next: () => void
  ): Promise<void> {
    res.status(200).send("It work's");
  }
}
