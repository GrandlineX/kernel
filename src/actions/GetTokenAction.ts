import { SPath, SPathUtil } from '@grandlinex/swagger-mate';
import { IBaseKernelModule } from '../lib/index.js';
import { ActionMode, BaseApiAction, JwtToken } from '../classes/index.js';
import CryptoClient from '../modules/crypto/CryptoClient.js';

import { XActionEvent } from '../lib/express.js';

@SPath({
  '/token': {
    post: {
      operationId: 'getToken',
      summary: 'Get API token',
      tags: ['kernel'],
      requestBody: SPathUtil.jsonBody({
        type: 'object',
        properties: {
          username: {
            type: 'string',
          },
          token: {
            type: 'string',
          },
        },
        required: ['username', 'token'],
      }),
      responses: SPathUtil.jsonResponse(
        '200',
        {
          type: 'object',
          properties: {
            token: {
              type: 'string',
            },
          },
          required: ['token'],
        },
        false,
        '403',
      ),
    },
  },
})
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

  async handler({
    req,
    res,
    extension,
  }: XActionEvent<JwtToken>): Promise<void> {
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

    const valid = await extension.timing.startFunc('validation', () =>
      cc.apiTokenValidation(username, token, 'api'),
    );
    if (valid.valid && valid.userId) {
      const jwt = await cc.jwtGenerateAccessToken(
        {
          userid: valid.userId,
          username,
        },
        req.body,
      );
      extension.done();
      res.status(200).send({ token: jwt });
    } else {
      res.status(403).send('no no no ...');
    }
  }
}
