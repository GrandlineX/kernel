import { ActionMode, Route } from '@grandlinex/swagger-mate';
import { RouteApiAction } from '../classes/index.js';

import { XActionEvent } from '../lib/express.js';

@Route('GET', '/version', {
  mode: ActionMode.DMZ,
  operationId: 'getVersion',
  summary: 'Get API version',
  tags: ['kernel'],
  responseSchema: {
    type: 'object',
    properties: {
      api: {
        type: 'number',
      },
    },
    required: ['api'],
  },
  responseCodes: ['200', '403'],
})
export default class ApiVersionAction extends RouteApiAction {
  async handler({ res, extension }: XActionEvent): Promise<void> {
    extension.done();
    res.status(200).send({ api: this.getKernel().getApiVersion() });
  }
}
