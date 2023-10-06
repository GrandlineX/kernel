import { SPath, SPathUtil } from '@grandlinex/swagger-mate';
import { IBaseKernelModule } from '../lib/index.js';
import { BaseApiAction, JwtToken } from '../classes/index.js';
import { XActionEvent } from '../lib/express.js';

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
export default class ApiAuthTestAction extends BaseApiAction {
  constructor(module: IBaseKernelModule<any, any, any, any>) {
    super('GET', '/test/auth', module);
    this.handler = this.handler.bind(this);
  }

  async handler({ data, res }: XActionEvent<JwtToken>): Promise<void> {
    this.debug(data.userid);
    res.status(200).send("It work's");
  }
}
