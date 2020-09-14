import { BaseService } from './services/BaseService';
import { logger } from './utils/Logger';

export class ServiceRegistry {

  private static _instance: ServiceRegistry = new ServiceRegistry();

  private servicesMap = new Map();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {
    logger.info("ServiceRegistry.constructor ");
  }

  public getServiseMap () {
    return this.servicesMap;
  }

  public static get instance () {
    return this._instance;
  }

  public register<T extends BaseService> (ctor: new (...args: any[]) => T, ...args: any[]) {
    const service = new ctor(...args);
    this.servicesMap.set(ctor, service);
    return this;
  }

  public getService<T extends BaseService> (ctor: new (...args: any[]) => T): T {
    return this.servicesMap.get(ctor);
  }

  public exists<T extends BaseService> (ctor: new (...args: any[]) => T): boolean {
    return !!this.getService(ctor);
  }
}

