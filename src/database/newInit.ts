import { SQLQuery } from '../modules/DBConnector/lib';

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
