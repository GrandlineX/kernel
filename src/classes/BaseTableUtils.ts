import {
  SPathUtil,
  type SKey,
  type SSchemaEl,
  type SSchemaElObj,
  type SwaggerRPathParameter,
  type SDataType,
} from '@grandlinex/swagger-mate';
import type { XActionEvent } from '../lib/express';
import TableQueryFields from './TableQueryFields';

const coreFields: {
  key: string;
  type: SDataType;
  description?: string;
}[] = [
  {
    key: 'page',
    type: 'number',
    description: 'The current page number >=0',
  },
  {
    key: 'pageSize',
    type: 'number',
    description:
      'The number of items per page, must be >0 and <=100 (default), 0 = no limit',
  },
  {
    key: 'sortBy',
    type: 'string',
    description:
      'The field name to sort by, must be a valid field name for the entity',
  },
  {
    key: 'sortDesc',
    type: 'boolean',
    description: 'If true, sort in descending order, otherwise ascending order',
  },
];

const coreQueryParam: SwaggerRPathParameter[] = coreFields.map(
  ({ key, description }) => ({
    name: key,
    in: 'query',
    required: false,
    description,
    schema: { type: 'string' },
  }),
);

const coreBodyParam: SSchemaElObj = {
  type: 'object',
  properties: coreFields.reduce<SSchemaElObj['properties']>(
    (prev, cur) => ({
      ...prev,
      [cur.key]: {
        type: cur.type,
        description: cur.description,
      },
    }),
    {},
  ),
};

export type TableQueryType = {
  page: number;
  pageSize: number;
  sortBy: string | undefined;
  sortDesc: boolean;
  fields: TableQueryFields;
};

export type Paging = {
  total: number;
  page: number;
  maxPage: number;
};

export class BaseTableUtils {
  /**
   * Builds a Swagger parameter list that includes standard pagination and sorting options
   *
   * @param {...SwaggerRPathParameter[]} param Existing query parameters to be appended.
   * @returns {SwaggerRPathParameter[]} An array of Swagger parameters containing the provided parameters plus
   *                                    the optional query parameters `page`, `pageSize`, `sortBy`, and `sortDesc`.
   */
  static queryParams(
    ...param: SwaggerRPathParameter[]
  ): SwaggerRPathParameter[] {
    return [...coreQueryParam, ...param];
  }

  /**
   * Creates a new schema element object that combines the default core body parameters
   * with the provided properties.
   *
   * @param {SSchemaElObj['properties']} param The properties to merge into the core body parameters.
   * @return {SSchemaElObj} The merged schema element object.
   */
  static bodyParams(param: SSchemaElObj['properties']): SSchemaElObj {
    return {
      ...coreBodyParam,
      properties: {
        ...coreBodyParam.properties,
        ...param,
      },
    };
  }

  static tableFieldQuery(
    { query, sendError }: XActionEvent,
    allowedSort?: string[],
    allowedFields: string[] = [],
    maxPageSize = 100,
  ): TableQueryType | null {
    const fields = new TableQueryFields();
    const { page, pageSize, sortBy, sortDesc } = query;

    for (const key of Object.keys(query)) {
      const defaultQuery = ['page', 'pageSize', 'sortBy', 'sortDesc'].includes(
        key,
      );
      const allowedQ = allowedFields.includes(key);
      if (allowedQ) {
        fields.set(key, String(query[key]));
      }
      if (!defaultQuery && !allowedQ) {
        sendError(400, {
          field: [
            {
              key,
              message: 'Unknown query parameter',
            },
          ],
        });
        return null;
      }
    }

    if (sortBy && !allowedSort) {
      sendError(400, {
        field: [
          {
            key: 'sortBy',
            message: 'Sorting is not allowed on this endpoint',
          },
        ],
      });
      return null;
    }

    if (sortBy && !allowedSort!.includes(sortBy)) {
      sendError(400, {
        field: [
          {
            key: 'sortBy',
            message: 'Invalid sortBy value',
          },
        ],
      });
      return null;
    }

    let xPage = 0;
    let xPageSize = 25;

    if (page) {
      xPage = parseInt(page, 10);
      if (Number.isNaN(xPage) || xPage < 0) {
        sendError(400, {
          field: [
            {
              key: 'page',
              message: 'Invalid page number',
            },
          ],
        });
        return null;
      }
    }

    if (pageSize) {
      xPageSize = parseInt(pageSize, 10);
      if (Number.isNaN(xPageSize) || xPageSize < 0 || xPageSize > maxPageSize) {
        sendError(400, {
          field: [
            {
              key: 'pageSize',
              message: 'Invalid page size number',
            },
          ],
        });
        return null;
      }
    }

    return {
      page: xPage,
      pageSize: xPageSize,
      sortBy: sortBy ?? undefined,
      sortDesc: sortDesc === 'true' || false,
      fields,
    };
  }

  static tableFieldBody(
    { body, sendError }: XActionEvent,
    allowedSort?: string[],
    allowedFields: string[] = [],
    maxPageSize = 100,
  ): TableQueryType | null {
    const fields = new TableQueryFields();
    const { page, pageSize, sortBy, sortDesc } = body;

    for (const key of Object.keys(body)) {
      const defaultQuery = ['page', 'pageSize', 'sortBy', 'sortDesc'].includes(
        key,
      );
      const allowedQ = allowedFields.includes(key);
      if (allowedQ) {
        fields.set(key, body[key]);
      }
      if (!defaultQuery && !allowedQ) {
        sendError(400, {
          field: [
            {
              key,
              message: 'Unknown body parameter',
            },
          ],
        });
        return null;
      }
    }

    if (sortBy && !allowedSort) {
      sendError(400, {
        field: [
          {
            key: 'sortBy',
            message: 'Sorting is not allowed on this endpoint',
          },
        ],
      });
      return null;
    }

    if (sortBy && !allowedSort!.includes(sortBy)) {
      sendError(400, {
        field: [
          {
            key: 'sortBy',
            message: 'Invalid sortBy value',
          },
        ],
      });
      return null;
    }

    let xPage = 0;
    let xPageSize = 25;

    if (page !== undefined) {
      if (!Number.isInteger(page) || page < 0) {
        sendError(400, {
          field: [
            {
              key: 'page',
              message: 'Invalid page number',
            },
          ],
        });
        return null;
      }
      xPage = page;
    }

    if (pageSize !== undefined) {
      if (
        !Number.isInteger(pageSize) ||
        pageSize < 0 ||
        pageSize > maxPageSize
      ) {
        sendError(400, {
          field: [
            {
              key: 'pageSize',
              message: 'Invalid page size number',
            },
          ],
        });
        return null;
      }
      xPageSize = pageSize;
    }

    return {
      page: xPage,
      pageSize: xPageSize,
      sortBy: sortBy ?? undefined,
      sortDesc: sortDesc === true,
      fields,
    };
  }

  static calcPages(query: TableQueryType, total: number): Paging {
    if (query.pageSize === 0) {
      return {
        total,
        page: 0,
        maxPage: 0,
      };
    }
    return {
      total,
      page: query.page,
      maxPage: Math.max(0, Math.ceil(total / query.pageSize) - 1),
    };
  }

  static PaginationSchema: SKey<SSchemaEl> = {
    Pagination: {
      type: 'object',
      properties: {
        total: {
          type: 'integer',
        },
        page: {
          type: 'integer',
        },
        maxPage: {
          type: 'integer',
        },
      },
      required: ['total', 'page', 'maxPage'],
    },
  };

  /**
   * Creates a JSON schema that represents a paginated table response.
   *
   * @param {SSchemaElObj} schema - The schema for each element in the `data` array.
   * @return {SSchemaElObj} A schema object that validates an object containing the properties:
   *   - `data`: an array of items matching the provided `schema`
   *   - `total`: an integer indicating the total number of items
   *   - `page`: an integer indicating the current page number
   *   - `maxPage`: an integer indicating the maximum number of pages
   */
  static tableSchema(schema: SSchemaEl): SSchemaElObj {
    return {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: schema,
        },
        paging: {
          $ref: SPathUtil.schemaPath('Pagination'),
        },
      },
      required: ['data', 'paging'],
    };
  }
}
