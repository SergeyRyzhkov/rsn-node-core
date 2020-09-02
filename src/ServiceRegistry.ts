import { BaseService } from './services/BaseService';

export class ServiceRegistry {
  private static _instance: ServiceRegistry = new ServiceRegistry();
  private servicesMap = new Map();
  private defaultService = new BaseService();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {

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
    const instance = this.servicesMap.get(ctor);
    return instance || this.defaultService;
  }
}

