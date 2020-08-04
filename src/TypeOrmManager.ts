import { createConnection, EntityManager, getManager } from 'typeorm';
import { AppConfig } from './utils/Config';

export class TypeOrmManager {

  private static connectionInit = false;

  public static async initConnection (entityList: any[]) {
    if (!this.connectionInit) {
      const config = { ...AppConfig.dbConfig, entities: entityList };
      await createConnection(config);
      this.connectionInit = true;
    }
  }

  public static get EntityManager (): EntityManager {
    return getManager();
  }

}

