import { Route } from '@grandlinex/swagger-mate';
import { RouteApiAction } from '../classes';
import type { XActionEvent } from '../lib/express';
import type { JwtToken } from '../lib';

@Route('GET', '/api/auth/test', {
  operationId: 'testAuth',
  summary: 'Test user auth',
  tags: ['kernel'],
  responseCodes: ['200', '403'],
})
export default class ApiAuthTestAction extends RouteApiAction {
  async handler({ data, res }: XActionEvent<JwtToken>): Promise<void> {
    this.debug(data.userid);
    res.status(200).send("It work's");
  }
}
