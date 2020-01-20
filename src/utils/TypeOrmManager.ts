import AppConfig from './Config';
import { createConnection, EntityManager, getManager } from 'typeorm';

export default class TypeOrmManager {

  public static async initConnection (typeOrmConnectionConfig, entityList: any[]) {
    if (!this.connectionInit) {
      const config = { ...typeOrmConnectionConfig, entities: entityList };
      await createConnection(config);
      this.connectionInit = true;
    }
  }

  private static connectionInit: boolean = false;

  public static get EntityManager (): EntityManager {
    return getManager();
  }

}

