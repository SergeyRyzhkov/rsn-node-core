import { createConnection, EntityManager, getManager } from 'typeorm';
import { ConfigManager } from '@/ConfigManager'

export class TypeOrmManager {

  private static connectionInit = false;

  public static async initConnection (entityList: any[]) {
    if (!this.connectionInit) {
      const dbConfig = ConfigManager.instance.getOptionsAsPlain("DatabaseConfig");
      const config = { ...dbConfig, entities: entityList };
      await createConnection(config);
      this.connectionInit = true;
    }
  }

  public static get EntityManager (): EntityManager {
    return getManager();
  }

}

