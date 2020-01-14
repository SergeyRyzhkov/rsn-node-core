import PgUtls from '@/utils/PgUtils';
import SortFilterPagination from '@/entities/SortFilterPagination';
import ClassTransform from '@/utils/ClassTransform';

export default class BaseService {

  public async getDbViewResult (viewName: string, sortFilterPagin?: SortFilterPagination, whereStmt?: string, whereParams?: any[]) {
    return PgUtls.getAnyFromDatabase(viewName, sortFilterPagin, whereStmt, whereParams);
  }


  public async getDbViewRowCount (viewName: string, whereStmt?: string, whereParams?: any[]) {
    return PgUtls.getCountFrom(viewName, whereStmt, whereParams);
  }

  public async getOneById (viewName: string, whereStmt: string, id: number) {
    return PgUtls.getOneFromDatabse(viewName, whereStmt, [id]);
  }

  public async getOneOrNone (selectStmt: string, whereParams?: any[]) {
    return PgUtls.getOneOrNone(selectStmt, whereParams);
  }

  public async getOneFromDatabse (viewName: string, whereStmt?: string, whereParams?: any[]) {
    return PgUtls.getOneFromDatabse(viewName, whereStmt, whereParams);
  }

  public async deleteById (viewName: string, whereStmt: string, id: number) {
    return PgUtls.delete(viewName, whereStmt, [id]);
  }

  public async execFunction (funcNameWithArgs: string, params?: any[]) {
    return PgUtls.execFunction(funcNameWithArgs, params);
  }

  public async execNone (sql: string, params?: any[]) {
    return PgUtls.execNone(sql, params);
  }

  public getOneEntityInstanceFromJson<T> (dbResult: {}, classType: new () => T): T {
    if (dbResult) {
      return ClassTransform.plainToClassInstanceOne<T>(dbResult, classType);
    }
    return null;
  }
}
