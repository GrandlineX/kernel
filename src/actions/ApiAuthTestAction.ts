import { Route } from '@grandlinex/swagger-mate';
import { JwtToken, RouteApiAction } from '../classes/index.js';
import { XActionEvent } from '../lib/express.js';

@Route('GET', '/test/auth', {
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
