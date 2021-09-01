import { Request, Response } from 'express';
import { IBaseKernelModule } from '../lib';
import { BaseApiAction } from '../classes';
import { CryptoClient } from '../modules';

/**
 * @openapi
 * /token:
 *   post:
 *     summary: Get Bearer for user.
 *     tags:
 *       - Kernel
 *     description: Returns JWT.
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       '403':
 *         description: Not Authorized
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               token:
 *                 type: string
 */

export default class GetTokenAction extends BaseApiAction {
  /**
   *
   * @param module Parent Module
   */
  constructor(module: IBaseKernelModule<any, any, any, any>) {
    super('POST', '/token', module);
    this.handler = this.handler.bind(this);
    this.setDmz(true);
  }

  async handler(req: Request, res: Response, next: () => void): Promise<void> {
    const cc = this.getKernel().getCryptoClient() as CryptoClient;

    if (!req.body.token) {
      res.status(400).send('no token');
      return;
    }
    if (!req.body.username) {
      res.status(401).send('no username');
      return;
    }

    const { username, token } = req.body;
    if (await cc.apiTokenValidation(username, token, 'api')) {
      const jwt = cc.jwtGenerateAccessToken({
        username,
      });
      res.status(200).send({ token: jwt });
    } else {
      res.status(403).send('no no no ...');
    }
  }
}
