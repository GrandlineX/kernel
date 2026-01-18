import {
  CoreAction,
  CoreEntity,
  IDataBase,
  instanceOfEntity,
} from '@grandlinex/core';
import {
  ActionMode,
  ErrorType,
  isErrorType,
  isSwaggerRef,
  SPathUtil,
  SSchemaEl,
} from '@grandlinex/swagger-mate';
import {
  IBaseAction,
  IBaseCache,
  IBaseClient,
  IBaseKernelModule,
  IBasePresenter,
  IKernel,
} from '../lib/index.js';
import { ExpressServerTiming, IExtensionInterface } from './timing/index.js';

import {
  XActionEvent,
  XPath,
  XQuery,
  XRequest,
  XResponse,
} from '../lib/express.js';
import { BaseUserAgent } from './BaseUserAgent.js';

export default abstract class BaseAction<
    K extends IKernel = IKernel,
    T extends IDataBase<any, any> | null = any,
    P extends IBaseClient | null = any,
    C extends IBaseCache | null = any,
    E extends IBasePresenter | null = any,
  >
  extends CoreAction<K, T, P, C, E>
  implements IBaseAction<K, T, P, C, E>
{
  mode: ActionMode;

  forceDebug: boolean;

  requestSchema: SSchemaEl | CoreEntity | string | null;

  constructor(chanel: string, module: IBaseKernelModule<K, T, P, C, E>) {
    super(chanel, module);
    this.secureHandler = this.secureHandler.bind(this);
    this.mode = ActionMode.DEFAULT;
    this.forceDebug = false;
    this.requestSchema = null;
  }

  abstract handler(event: XActionEvent): Promise<void>;

  static validateSchema(
    error: ErrorType,
    inputSchema: SSchemaEl | CoreEntity | string,
    key: string,
    field: any,
    required: boolean = true,
  ) {
    let schema: SSchemaEl | string;
    if (instanceOfEntity(inputSchema)) {
      schema = SPathUtil.schemaFromEntity(inputSchema)!;
    } else {
      schema = inputSchema;
    }
    if (isSwaggerRef(schema) || typeof schema === 'string') {
      error.field?.push({
        key,
        message: `Ref or string schema body validation is not supported yet`,
      });
      return;
    }
    if (!required && field === undefined) {
      return;
    }
    if (schema.nullable && field === null) {
      return;
    }
    switch (schema?.type) {
      case 'boolean':
        if (typeof field !== 'boolean') {
          error.field?.push({
            key,
            message: `must be a boolean`,
          });
        }
        break;
      case 'integer':
      case 'number':
        if (typeof field !== 'number') {
          error.field?.push({
            key,
            message: `must be a number`,
          });
        }
        break;
      case 'string':
        if (typeof field !== 'string') {
          error.field?.push({
            key,
            message: `must be a string`,
          });
        }
        break;
      case 'array':
        if (!Array.isArray(field)) {
          error.field?.push({
            key,
            message: `must be a array`,
          });
        }
        if (schema.items) {
          field.forEach((it: any, id: number) => {
            this.validateSchema(error, schema.items!, `${key}[${id}]`, it);
          });
        }
        break;
      case 'object':
        if (typeof field !== 'object') {
          error.field?.push({
            key,
            message: `must be a object`,
          });
        }
        if (schema.properties) {
          Object.entries(schema.properties).forEach(([k, s]) => {
            this.validateSchema(
              error,
              s,
              `${key}.${k}`,
              field[k],
              schema.required ? schema.required.includes(k) : false,
            );
          });
        }
        break;
      case undefined:
      default:
        error.field?.push({
          key,
          message: `Schema type is not defined or not supported`,
        });
    }
  }

  bodyValidation<A>(req: XRequest): A | ErrorType | null {
    if (!this.requestSchema) {
      return null;
    }
    if (!req.body) {
      return null;
    }
    const error: ErrorType = {
      type: 'error',
      global: [],
      field: [],
    };
    BaseAction.validateSchema(error, this.requestSchema, 'body', req.body);
    if (error.field!.length > 0 || error.global!.length > 0) {
      return error;
    }
    return req.body as A;
  }

  static sendError(res: XResponse, code: number, error: Partial<ErrorType>) {
    res.status(code).send({
      type: 'error',
      ...error,
    });
  }

  async secureHandler(
    req: XRequest,
    res: XResponse,
    next: () => void,
  ): Promise<void> {
    const xPath: XPath = {};
    Object.entries(req.params).forEach(([k, v]) => {
      if (typeof v === 'string') {
        xPath[k] = v;
      }
    });
    const xQuery: XQuery = {};
    Object.entries(req.query).forEach(([k, v]) => {
      if (typeof v === 'string' || v === undefined) {
        xQuery[k] = v;
      }
    });
    const extension = this.initExtension(res);
    const auth = extension.timing.start('auth');
    res.on('finish', () => {
      (this.getKernel() as IKernel).responseCodeFunction({
        code: res.statusCode,
        req,
      });
    });
    const cc = this.getKernel().getCryptoClient();
    if (!cc) {
      res.status(504).send('internal server error');
      return;
    }

    if (this.mode === ActionMode.DMZ) {
      auth.stop();
      try {
        let body = null;
        if (this.requestSchema) {
          body = this.bodyValidation(req);
        }
        if (isErrorType(body)) {
          this.debug(body);
          res.status(400).send(body);
          return;
        }
        if (this.requestSchema && body === null) {
          res.sendStatus(400);
          return;
        }
        await this.handler({
          res,
          req,
          next,
          data: null,
          extension,
          agent: new BaseUserAgent(req),
          body,
          path: xPath,
          query: xQuery,
          sendError: (code: number, error: Partial<ErrorType>) =>
            BaseAction.sendError(res, code, error),
        });
      } catch (e: any) {
        this.error(e);
        this.error(e?.message);
        if (!res.headersSent) {
          res.sendStatus(500);
        }
      }
      return;
    }
    const dat = await cc.bearerTokenValidation(req);
    auth.stop();
    if (dat && typeof dat !== 'number') {
      try {
        let body = null;
        if (this.requestSchema) {
          body = this.bodyValidation(req);
        }
        if (isErrorType(body)) {
          this.debug(body);
          res.status(400).send(body);
          return;
        }
        if (this.requestSchema && body === null) {
          res.sendStatus(400);
          return;
        }
        await this.handler({
          res,
          req,
          next,
          data: dat,
          extension,
          agent: new BaseUserAgent(req),
          body,
          path: xPath,
          query: xQuery,
          sendError: (code: number, error: Partial<ErrorType>) =>
            BaseAction.sendError(res, code, error),
        });
      } catch (e: any) {
        this.error(e);
        this.error(e?.message);
        if (!res.headersSent) {
          res.sendStatus(500);
        }
      }
    } else if (this.mode === ActionMode.DMZ_WITH_USER) {
      try {
        let body = null;
        if (this.requestSchema) {
          body = this.bodyValidation(req);
        }
        if (isErrorType(body)) {
          this.debug(body);
          res.status(400).send(body);
          return;
        }
        if (this.requestSchema && body === null) {
          res.sendStatus(400);
          return;
        }
        await this.handler({
          res,
          req,
          next,
          data: null,
          extension,
          agent: new BaseUserAgent(req),
          body,
          path: xPath,
          query: xQuery,
          sendError: (code: number, error: Partial<ErrorType>) =>
            BaseAction.sendError(res, code, error),
        });
      } catch (e: any) {
        this.error(e);
        this.error(e?.message);
        if (!res.headersSent) {
          res.sendStatus(500);
        }
      }
    } else if (dat) {
      res.sendStatus(dat);
    } else {
      res.sendStatus(401);
    }
  }

  setMode(mode: ActionMode): void {
    this.mode = mode;
  }
  abstract register(): void;

  private initExtension(res: XResponse): IExtensionInterface {
    const [el, fx] = ExpressServerTiming.init(this, res);
    return {
      done: () => {
        fx();
      },
      timing: el,
    };
  }
}
