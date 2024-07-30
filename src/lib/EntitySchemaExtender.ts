import { CoreEntity, getEntityMeta } from '@grandlinex/core';
import {
  isSwaggerRef,
  SKey,
  SPathUtil,
  SSchemaEl,
} from '@grandlinex/swagger-mate';

export default class EntitySchemaExtender {
  public static extendEntitySchema(
    entity: CoreEntity,
    ...options: {
      key: string;
      list?: boolean;
      entity?: CoreEntity;
      schema?: SSchemaEl;
      required?: boolean;
    }[]
  ): SKey<SSchemaEl> {
    const meta = getEntityMeta(entity);
    if (meta) {
      const schema = SPathUtil.schemaEntryGen(entity)[meta.name];
      if (schema && !isSwaggerRef(schema) && schema.properties) {
        for (const option of options) {
          if (option.schema) {
            if (option.list) {
              schema.properties[option.key] = {
                type: 'array',
                items: option.schema,
              };
            } else {
              schema.properties[option.key] = option.schema;
            }
          } else if (option.entity) {
            const eMeta = getEntityMeta(option.entity);
            if (eMeta) {
              const scheme = SPathUtil.schemaEntryGen(option.entity)[
                eMeta.name
              ];
              if (option.list) {
                schema.properties[option.key] = {
                  type: 'array',
                  items: scheme,
                };
              } else {
                schema.properties[option.key] = scheme;
              }
            }
          }
          if (option.required) {
            schema.required = [...(schema.required || []), option.key];
          }
        }
      }
      return {
        [meta.name]: schema,
      };
    }
    return {};
  }
}
