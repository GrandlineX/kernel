import { ActionMode, Route } from '@grandlinex/swagger-mate';
import { RouteApiAction } from '../classes';

import type { XActionEvent } from '../lib/express';

@Route('GET', '/api/version', {
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
  async handler({ res }: XActionEvent): Promise<void> {
    res.status(200).send({ api: this.getKernel().getApiVersion() });
  }
}
