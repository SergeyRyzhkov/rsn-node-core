import { IMain, IDatabase } from 'pg-promise';
import pgPromise from 'pg-promise';
import { SortPagination } from '../models/SortPagination';
import camelcaseKeys from 'camelcase-keys';
import { ConfigManager } from '../ConfigManager';
import { DatabaseConfig } from "../DatabaseConfig";
import { logger } from './Logger';



enum TypeId {
  BOOL = 16,
  BYTEA = 17,
  CHAR = 18,
  INT8 = 20,
  INT2 = 21,
  INT4 = 23,
  REGPROC = 24,
  TEXT = 25,
  OID = 26,
  TID = 27,
  XID = 28,
  CID = 29,
  JSON = 114,
  XML = 142,
  PG_NODE_TREE = 194,
  SMGR = 210,
  PATH = 602,
  POLYGON = 604,
  CIDR = 650,
  FLOAT4 = 700,
  FLOAT8 = 701,
  ABSTIME = 702,
  RELTIME = 703,
  TINTERVAL = 704,
  CIRCLE = 718,
  MACADDR8 = 774,
  MONEY = 790,
  MACADDR = 829,
  INET = 869,
  ACLITEM = 1033,
  BPCHAR = 1042,
  VARCHAR = 1043,
  DATE = 1082,
  TIME = 1083,
  TIMESTAMP = 1114,
  TIMESTAMPTZ = 1184,
  INTERVAL = 1186,
  TIMETZ = 1266,
  BIT = 1560,
  VARBIT = 1562,
  NUMERIC = 1700,
  REFCURSOR = 1790,
  REGPROCEDURE = 2202,
  REGOPER = 2203,
  REGOPERATOR = 2204,
  REGCLASS = 2205,
  REGTYPE = 2206,
  UUID = 2950,
  TXID_SNAPSHOT = 2970,
  PG_LSN = 3220,
  PG_NDISTINCT = 3361,
  PG_DEPENDENCIES = 3402,
  TSVECTOR = 3614,
  TSQUERY = 3615,
  GTSVECTOR = 3642,
  REGCONFIG = 3734,
  REGDICTIONARY = 3769,
  JSONB = 3802,
  REGNAMESPACE = 4089,
  REGROLE = 4096
}


// FIXME: Логгирование ошибок
class PostgresWrapper {
  private postgrePromise: IDatabase<any>;
  private dbConfig = ConfigManager.instance.getOptionsAsPlain(DatabaseConfig);

  constructor() {
    const initOptions = {
      ...this.dbConfig.pgOptions,
      receive: (data, result) => {
        result.rows = camelcaseKeys(data);
      },
      error: (err: any) => {
        logger.error(err);
      }
    };

    const pgp: IMain = pgPromise(initOptions);
    pgp.pg.types.setTypeParser(TypeId.INT8, parseInt);
    pgp.pg.types.setTypeParser(TypeId.NUMERIC, parseInt);
    this.postgrePromise = pgp(this.dbConfig);
  }

  public async any (query: string): Promise<any[]> {
    return this.postgrePromise.any({
      text: query
    });
  }

  public async anyWhere (tableName: string, sortFilterPagin?: SortPagination, whereStmt?: string, whereParams?: any[]): Promise<any[]> {
    const selectStmt = this.buildSelectStatement(tableName, sortFilterPagin, whereStmt);
    return this.postgrePromise.any({
      text: selectStmt,
      values: whereParams
    });
  }

  public async oneOrNoneWhere (tableName: string, whereStmt?: string, whereParams?: any[]): Promise<any> {
    const selectStmt = this.buildSelectStatement(tableName, null, whereStmt);
    return this.postgrePromise.oneOrNone({
      text: selectStmt,
      values: whereParams
    });
  }

  public async oneOrNone (query: string): Promise<any> {
    return this.postgrePromise.oneOrNone(query);
  }

  public async delete (tableName: string, whereStmt: string, whereParams?: any[]) {
    const stmtp = `DELETE FROM ${tableName} WHERE ${whereStmt} `;
    const params = whereParams;
    return this.postgrePromise.none(stmtp, params);
  }

  public async execFunction (functionName: string, params?: any[]): Promise<any> {
    return this.postgrePromise.func(functionName, params);
  }

  public async getCountFrom (tableName: string, whereStmt?: string, whereParams?: any[]) {
    let count = 0;
    const selectStmtp = `SELECT COUNT(*) FROM ${tableName}`;
    let whereAdd = '';
    if (whereStmt != null) {
      whereAdd = ` WHERE ${whereStmt} `;
    }
    const countObj = await this.postgrePromise.one({
      text: selectStmtp + whereAdd,
      values: whereParams
    });

    if (countObj && countObj.count) {
      count = Number(countObj.count.toString());
    }

    return count;
  }


  public async execNone (statement: string, params?: any[]) {
    return this.postgrePromise.none(statement, params);
  }

  // FIXME: Для пагинации обязательно нужен order
  private buildSelectStatement (tableName: string, sortFilterPagin?: SortPagination, whereStmt?: string) {
    const selectStmtp = `SELECT * FROM ${tableName}`;
    let whereAdd = '';
    let limitOffsetAdd = '';
    let sortAdd = '';

    if (whereStmt) {
      whereAdd = ` WHERE ${whereStmt} `;
    }

    if (sortFilterPagin) {
      if (sortFilterPagin.sort && sortFilterPagin.sort.sortField) {
        sortAdd = ` ORDER BY ${sortFilterPagin.sort.sortField} ${sortFilterPagin.sort.sortType} `;
      }
      if (sortFilterPagin.pagination && sortFilterPagin.pagination.limit && sortFilterPagin.pagination.offset) {
        limitOffsetAdd = ` LIMIT ${sortFilterPagin.pagination.limit} OFFSET ${sortFilterPagin.pagination.offset}`;
      }
    }

    return selectStmtp + whereAdd + sortAdd + limitOffsetAdd;
  }

}

export const postgresWrapper = new PostgresWrapper();

