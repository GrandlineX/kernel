import { SPath, SPathUtil } from '@grandlinex/swagger-mate';
import { IBaseKernelModule } from '../lib/index.js';
import { ActionMode, BaseApiAction } from '../classes/index.js';

import { XActionEvent } from '../lib/express.js';

@SPath({
  '/version': {
    get: {
      operationId: 'getVersion',
      summary: 'Get API version',
      tags: ['kernel'],
      responses: SPathUtil.jsonResponse(
        '200',
        {
          type: 'object',
          properties: {
            api: {
              type: 'number',
            },
          },
          required: ['api'],
        },
        false,
        '403',
      ),
    },
  },
})
export default class ApiVersionAction extends BaseApiAction {
  constructor(module: IBaseKernelModule) {
    super('GET', '/version', module);
    this.handler = this.handler.bind(this);
    this.setMode(ActionMode.DMZ);
  }

  async handler({ res, extension }: XActionEvent): Promise<void> {
    extension.done();
    res.status(200).send({ api: this.getKernel().getApiVersion() });
  }
}
