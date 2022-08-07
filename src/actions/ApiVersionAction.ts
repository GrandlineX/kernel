import e from 'express';
import { IBaseKernelModule, IKernel } from '../lib';
import { BaseApiAction } from '../classes';
import { ActionMode } from '../classes/BaseAction';
import { IExtensionInterface } from '../classes/timing/ExpressServerTiming';

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
  constructor(module: IBaseKernelModule) {
    super('GET', '/version', module);
    this.handler = this.handler.bind(this);
    this.setMode(ActionMode.DMZ);
  }

  async handler(
    req: e.Request,
    res: e.Response,
    next: () => void,
    data: any,
    ex: IExtensionInterface
  ): Promise<void> {
    ex.done();
    res.status(200).send({ api: 1 });
  }
}
