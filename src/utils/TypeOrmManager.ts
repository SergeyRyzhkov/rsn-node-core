import AppConfig from './Config';
import { createConnection, EntityManager, getManager, getRepository, Repository } from 'typeorm';
import EntityModelMetadata from '../entities/index';

class TypeOrmManager {

  public static async initConnection () {
    if (!this.connectionInit) {
      const config = { ...AppConfig.typeOrm, entities: EntityModelMetadata };
      await createConnection(config);
      this.connectionInit = true;
    }
  }

  private static connectionInit: boolean = false;

  public static get EntityManager (): EntityManager {
    this.initConnection();
    return getManager();
  }

}



export default TypeOrmManager;
