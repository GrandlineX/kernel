import { RawQuery } from '@grandlinex/core';

function newInit(schema: string): RawQuery[] {
  return [
    {
      exec: `CREATE TABLE ${schema}.keys
                   (
                       id     SERIAL PRIMARY KEY,
                       secret TEXT,
                       iv     BYTEA,
                       auth   BYTEA
                   );`,
      param: [],
    },
  ];
}

export default newInit;
