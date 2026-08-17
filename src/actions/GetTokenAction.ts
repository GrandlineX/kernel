import {
  ActionMode,
  Route,
  SComponent,
  SPathUtil,
} from '@grandlinex/swagger-mate';

import { RouteApiAction } from '../classes';

import type { XActionEvent } from '../lib/express';
import type { JwtToken } from '../lib';

type SchemaType = {
  username: string;
  password: string;
  top?: string;
};

@SComponent({
  schemas: {
    TokenData: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
        },
        refresh: {
          type: 'string',
        },
      },
      required: ['token'],
    },
  },
})
@Route('POST', '/api/token', {
  mode: ActionMode.DMZ,
  operationId: 'getToken',
  summary: 'Get API token',
  tags: ['kernel'],
  requestSchema: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
      },
      password: {
        type: 'string',
      },
      top: {
        type: 'string',
      },
    },
    required: ['username', 'password'],
  },
  parameters: [
    {
      in: 'query',
      name: 'refresh',
      schema: { type: 'string' },
      required: false,
    },
  ],
  responseSchema: SPathUtil.schemaPath('TokenData'),
  responseCodes: ['200', '403'],
})
export default class GetTokenAction extends RouteApiAction {
  async handler({
    res,
    extension,
    body,
    query: { refresh },
  }: XActionEvent<JwtToken, SchemaType>): Promise<void> {
    const cc = this.getKernel().getCryptoClient()!;
    const { username, password, top } = body;
    const valid = await extension.timing.startFunc('validation', () =>
      cc.apiTokenValidation({
        username,
        password,
        top,
        requestType: 'api',
      }),
    );
    if (valid.valid && valid.userId) {
      const tokenData = await cc.generateToken(
        valid.userId,
        username,
        refresh === 'true',
      );

      await cc.setCookie(res, tokenData);
      res.status(200).send(tokenData);
    } else {
      res.status(403).send('no no no ...');
    }
  }
}
