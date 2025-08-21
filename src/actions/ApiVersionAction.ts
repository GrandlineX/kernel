import { SPath, SPathUtil } from '@grandlinex/swagger-mate';
import { ActionMode, RouteApiAction } from '../classes/index.js';

import { XActionEvent } from '../lib/express.js';
import { Route } from '../annotation/index.js';

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
@Route('GET', '/version', ActionMode.DMZ)
export default class ApiVersionAction extends RouteApiAction {
  async handler({ res, extension }: XActionEvent): Promise<void> {
    extension.done();
    res.status(200).send({ api: this.getKernel().getApiVersion() });
  }
}
