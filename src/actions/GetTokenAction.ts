import { IBaseKernelModule } from '../lib/index.js';
import {
  BaseApiAction,
  IExtensionInterface,
  ActionMode,
} from '../classes/index.js';
import CryptoClient from '../modules/crypto/CryptoClient.js';

import { XRequest, XResponse } from '../lib/express.js';

export default class GetTokenAction extends BaseApiAction {
  /**
   *
   * @param module Parent Module
   */
  constructor(module: IBaseKernelModule<any, any, any, any>) {
    super('POST', '/token', module);
    this.handler = this.handler.bind(this);
    this.setMode(ActionMode.DMZ);
  }

  async handler(
    req: XRequest,
    res: XResponse,
    next: () => void,
    data: any,
    ex: IExtensionInterface
  ): Promise<void> {
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

    const valid = await ex.timing.startFunc('validation', () =>
      cc.apiTokenValidation(username, token, 'api')
    );
    if (valid.valid && valid.userId) {
      const jwt = await cc.jwtGenerateAccessToken({
        userid: valid.userId,
        username,
      });
      ex.done();
      res.status(200).send({ token: jwt });
    } else {
      res.status(403).send('no no no ...');
    }
  }
}
