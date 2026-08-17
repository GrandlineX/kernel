import { ActionMode, Route, SPathUtil } from '@grandlinex/swagger-mate';
import { RouteApiAction } from '../classes';
import type { XActionEvent } from '../lib/express';
import type { JwtToken } from '../lib';

@Route('POST', '/api/token/refresh', {
  mode: ActionMode.DMZ,
  operationId: 'refreshToken',
  summary: 'Refresh API token',
  tags: ['kernel'],
  responseSchema: SPathUtil.schemaPath('TokenData'),
  responseCodes: ['200', '403'],
})
export default class RefreshTokenAction extends RouteApiAction {
  async handler({
    req,
    res,
    extension,
  }: XActionEvent<JwtToken>): Promise<void> {
    const cc = this.getKernel().getCryptoClient()!;
    const token = await cc.bearerTokenValidation(req);
    if (typeof token === 'number') {
      res.sendStatus(token);
      return;
    }
    const valid = await extension.timing.startFunc('validation', () =>
      cc.apiTokenValidation({
        refresh: token,
        requestType: 'refresh',
      }),
    );
    if (valid.valid && valid.userId) {
      const tokenData = await cc.generateRefreshToken(token);
      if (tokenData) {
        await cc.setCookie(res, tokenData);
        res.status(200).send(tokenData);
        return;
      }
    }
    res.status(403).send('no no no ...');
  }
}
