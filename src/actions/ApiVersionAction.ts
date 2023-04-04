import { IBaseKernelModule } from '../lib/index.js';
import {
  BaseApiAction,
  IExtensionInterface,
  ActionMode,
} from '../classes/index.js';

import { XRequest, XResponse } from '../lib/express.js';

/**
 * @name ApiVersionAction
 *
 */

export default class ApiVersionAction extends BaseApiAction {
  constructor(module: IBaseKernelModule) {
    super('GET', '/version', module);
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
    ex.done();
    res.status(200).send({ api: 1 });
  }
}
