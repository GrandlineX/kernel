import {
  SPathUtil,
  type SKey,
  type SSchemaEl,
  type SSchemaElObj,
  type SwaggerRPathParameter,
} from '@grandlinex/swagger-mate';
import type { XActionEvent } from '../lib/express';

const coreParam: SwaggerRPathParameter[] = [
  {
    name: 'page',
    in: 'query',
    required: false,
    schema: { type: 'string' },
  },
  {
    name: 'pageSize',
    in: 'query',
    required: false,
    schema: { type: 'string' },
  },
  {
    name: 'sortBy',
    in: 'query',
    required: false,
    schema: { type: 'string' },
  },
  {
    name: 'sortDesc',
    in: 'query',
    required: false,
    schema: { type: 'string' },
  },
];

export type TableQueryType = {
  page: number;
  pageSize: number;
  sortBy: string | undefined;
  search: string | undefined;
  sortDesc: boolean;
  query: Map<string, string>;
};

export type Paging = {
  total: number;
  page: number;
  maxPage: number;
};

export class BaseTableUtils {
  /**
   * Builds a Swagger parameter list that includes standard pagination and sorting options + search.
   *
   * @param {...SwaggerRPathParameter[]} param Existing query parameters to be appended.
   * @returns {SwaggerRPathParameter[]} An array of Swagger parameters containing the provided parameters plus
   *                                    the optional query parameters `page`, `pageSize`, `sortBy`, and `sortDesc`.
   */
  static queryParams(
    ...param: SwaggerRPathParameter[]
  ): SwaggerRPathParameter[] {
    return [
      ...coreParam,
      {
        name: 'search',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      ...param,
    ];
  }

  /**
   * Parses and validates table query parameters from an XActionEvent.
   * @param query
   * @param sendError
   * @param allowedSort
   * @param allowedQuery
   * @param maxPageSize
   */
  static tableQuery(
    { query, sendError }: XActionEvent,
    allowedSort?: string[],
    allowedQuery: string[] = [],
    maxPageSize = 100,
  ): TableQueryType | null {
    const q = new Map<string, string>();
    const { page, pageSize, sortBy, sortDesc, search } = query;

    for (const key of Object.keys(query)) {
      const defaultQuery = [
        'page',
        'pageSize',
        'sortBy',
        'sortDesc',
        'search',
      ].includes(key);
      const allowedQ = allowedQuery.includes(key);
      if (allowedQ) {
        q.set(key, String(query[key]));
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
    let xSearch;

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

    if (search) {
      xSearch = String(search);
    }

    return {
      page: xPage,
      pageSize: xPageSize,
      sortBy: sortBy ?? undefined,
      sortDesc: sortDesc === 'true' || false,
      search: xSearch,
      query: q,
    };
  }

  /**
   * Returns an array of {@link SwaggerRPathParameter} that includes the default core parameters
   * followed by any additional parameters supplied.
   *
   * @param {SwaggerRPathParameter[]} param The additional SwaggerRPathParameter objects to append.
   * @returns {SwaggerRPathParameter[]} A combined array of core and supplied parameters. */
  static simpleQueryParams(
    ...param: SwaggerRPathParameter[]
  ): SwaggerRPathParameter[] {
    return [...coreParam, ...param];
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
