import { SPath, SPathUtil, SSchemaEl } from '@grandlinex/swagger-mate';
import { ActionMode, JwtToken, RouteApiAction } from '../classes/index.js';
import CryptoClient from '../modules/crypto/CryptoClient.js';

import { XActionEvent } from '../lib/express.js';
import { Route } from '../annotation/index.js';

const schema: SSchemaEl = {
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
};
type SchemaType = {
  username: string;
  token: string;
};

@SPath({
  '/token': {
    post: {
      operationId: 'getToken',
      summary: 'Get API token',
      tags: ['kernel'],
      requestBody: SPathUtil.jsonBody(schema),
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
@Route('POST', '/token', ActionMode.DMZ, schema)
export default class GetTokenAction extends RouteApiAction {
  async handler({
    req,
    res,
    extension,
    body,
  }: XActionEvent<JwtToken, SchemaType>): Promise<void> {
    const cc = this.getKernel().getCryptoClient() as CryptoClient;
    const { username, token } = body;
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
