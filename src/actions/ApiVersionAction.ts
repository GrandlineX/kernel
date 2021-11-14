import e from 'express';
import { IBaseKernelModule } from '../lib';
import { BaseApiAction } from '../classes';

/**
 * @name ApiVersionAction
 *
 * @openapi
 * /version:
 *   get:
 *     summary: get api schema version
 *     tags:
 *       - Kernel
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 api:
 *                   type: number
 *       401:
 *         description: invalid token / not authorized
 *
 */

export default class ApiVersionAction extends BaseApiAction {
  constructor(module: IBaseKernelModule<any, any, any, any>) {
    super('GET', '/version', module);
    this.handler = this.handler.bind(this);
    this.setDmz(true);
  }

  async handler(
    req: e.Request,
    res: e.Response,
    next: () => void
  ): Promise<void> {
    res.status(200).send({ api: 1 });
  }
}
