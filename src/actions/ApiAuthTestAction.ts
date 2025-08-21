import { SPath, SPathUtil } from '@grandlinex/swagger-mate';
import { JwtToken, RouteApiAction } from '../classes/index.js';
import { XActionEvent } from '../lib/express.js';
import { Route } from '../annotation/index.js';

@SPath({
  '/test/auth': {
    get: {
      operationId: 'testAuth',
      summary: 'Test user auth',
      tags: ['kernel'],
      responses: SPathUtil.defaultResponse('200', '403'),
    },
  },
})
@Route('GET', '/test/auth')
export default class ApiAuthTestAction extends RouteApiAction {
  async handler({ data, res }: XActionEvent<JwtToken>): Promise<void> {
    this.debug(data.userid);
    res.status(200).send("It work's");
  }
}
