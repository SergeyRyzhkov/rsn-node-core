import { BaseService } from './services/BaseService';

class ServiceRegistry {
  private servicesMap = new Map();
  private defaultService = new BaseService();

  public register<T extends BaseService> (type: new (...args: any[]) => T, ...args: any[]) {
    if (!this.servicesMap.get(type)) {
      const service = new type(...args);
      this.servicesMap.set(type, service);
    }
    return this;
  }

  public getService<T extends BaseService> (type: new (...args: any[]) => T): T {
    const instance = this.servicesMap.get(type);
    return instance || this.defaultService;
  }

}

export const serviceRegistry = new ServiceRegistry();


