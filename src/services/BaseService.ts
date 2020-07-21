import { postgresWrapper } from '@/PostgresWrapper';
import { SortFilterPagination } from '@/entities/SortFilterPagination';

export class BaseService {

  // public async anyWhere (tableName: string, sortFilterPagin?: SortFilterPagination, whereStmt?: string, whereParams?: any[]) {
  //   return PostgresWrapper.anyWhere(tableName, sortFilterPagin, whereStmt, whereParams);
  // }


  // public async getCountFrom (viewName: string, whereStmt?: string, whereParams?: any[]) {
  //   return PostgresWrapper.getCountFrom(viewName, whereStmt, whereParams);
  // }

  // public async oneOrNoneById (viewName: string, whereStmt: string, id: number) {
  //   return PostgresWrapper.oneOrNoneWhere(viewName, whereStmt, [id]);
  // }

  // // public async oneOrNoneWhere (selectStmt: string, whereParams?: any[]) {
  // //   return PostgresWrapper.oneOrNoneWhere(selectStmt, whereParams);
  // // }

  // public async deleteById (viewName: string, whereStmt: string, id: number) {
  //   return PostgresWrapper.delete(viewName, whereStmt, [id]);
  // }

  // public async execFunction (funcNameWithArgs: string, params?: any[]) {
  //   return PostgresWrapper.execFunction(funcNameWithArgs, params);
  // }

  // public async execNone (sql: string, params?: any[]) {
  //   return PostgresWrapper.execNone(sql, params);
  // }

  // public getOneEntityInstanceFromJson<T> (dbResult: {}, classType: new () => T): T {
  //   if (dbResult) {
  //     return ClassTransform.plainToClassInstanceOne<T>(dbResult, classType);
  //   }
  //   return null;
  // }
}
