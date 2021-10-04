import { SQLQuery } from '@grandlinex/core';

function newInit(schema: string): SQLQuery[] {
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
