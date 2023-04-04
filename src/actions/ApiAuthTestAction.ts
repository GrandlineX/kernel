import { IBaseKernelModule } from '../lib/index.js';
import { BaseApiAction, JwtToken } from '../classes/index.js';
import { XRequest, XResponse } from '../lib/express.js';

/**
 * @name ApiAuthTestAction
 *
 */

export default class ApiAuthTestAction extends BaseApiAction {
  constructor(module: IBaseKernelModule<any, any, any, any>) {
    super('GET', '/test/auth', module);
    this.handler = this.handler.bind(this);
  }

  async handler(
    req: XRequest,
    res: XResponse,
    next: () => void,
    data: JwtToken
  ): Promise<void> {
    this.debug(data.userid);
    res.status(200).send("It work's");
  }
}
