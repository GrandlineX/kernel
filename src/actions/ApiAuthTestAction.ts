import { IBaseKernelModule } from '../lib';
import { BaseApiAction, JwtToken } from '../classes';
import { XRequest, XResponse } from '../lib/express';

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
    req: XRequest,
    res: XResponse,
    next: () => void,
    data: JwtToken
  ): Promise<void> {
    this.debug(data.userid);
    res.status(200).send("It work's");
  }
}
