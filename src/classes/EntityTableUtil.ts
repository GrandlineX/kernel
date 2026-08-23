import {
  type CoreEntity,
  type CoreEntityWrapper,
  type QInterface,
  type QInterfaceSearch,
  XUtil,
} from '@grandlinex/core';
import { SPathUtil, type SSchemaElObj } from '@grandlinex/swagger-mate';
import { BaseTableUtils, type TableQueryType } from './BaseTableUtils';
import type { XActionEvent } from '../lib/express';

export default class EntityTableUtil extends BaseTableUtils {
  static entityTableSchema(entity: CoreEntity): SSchemaElObj {
    return this.tableSchema({
      $ref: SPathUtil.schemaPath(XUtil.getEntityNames(entity).className),
    });
  }

  private static async entityTable<T extends CoreEntity>(
    wrapper: CoreEntityWrapper<T>,
    query: TableQueryType,
    search: QInterfaceSearch<T> = {},
  ) {
    const eQuery = this.queryEntity<T>(query);
    const data = await wrapper.getObjList({ search, ...eQuery });
    const counter = await wrapper.count(search);

    return {
      data,
      paging: this.calcPages(query, counter),
    };
  }

  static async entityQuery<T extends CoreEntity>({
    event,
    wrapper,
    filter,
    allowedQuery,
    maxPageSize,
    afterFunction,
  }: {
    event: XActionEvent;
    wrapper: CoreEntityWrapper<T>;
    filter?: (query: TableQueryType) => QInterfaceSearch<T>;
    allowedQuery?: string[];
    maxPageSize?: number;
    afterFunction?: (arr: T[]) => Promise<any[]>;
  }) {
    const sort: string[] = [];
    wrapper.getPropMap().forEach((value, key) => {
      if (value.dataType !== 'json' && value.dataType !== 'blob') {
        sort.push(key as string);
      }
    });
    const query = this.tableQuery(event, sort, allowedQuery, maxPageSize);
    if (!query) {
      return;
    }
    const data = await this.entityTable(wrapper, query, filter?.(query));
    if (afterFunction) {
      data.data = await afterFunction(data.data);
    }
    event.res.status(200).send(data);
  }

  /**
   * Generates a SQL fragment for pagination and sorting based on the provided query options.
   *
   * @param {TableQueryType} query - An object containing pagination and optional sorting information.s
   *
   * @returns {string} A tuple where the first element is the SQL fragment string and the second element is an array of parameters to be bound to the query.
   */
  private static queryEntity<T extends CoreEntity>(
    query: TableQueryType,
  ): Omit<QInterface<T>, 'search'> {
    if (query.sortBy) {
      return {
        offset: query.page * query.pageSize,
        limit: query.pageSize === 0 ? undefined : query.pageSize,
        order: [
          {
            key: query.sortBy as keyof T,
            order: query.sortDesc ? 'DESC' : 'ASC',
          },
        ],
      };
    }
    return {
      offset: query.page * query.pageSize,
      limit: query.pageSize === 0 ? undefined : query.pageSize,
    };
  }
}
