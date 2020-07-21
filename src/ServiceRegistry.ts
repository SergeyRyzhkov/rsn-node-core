
import { UserService } from './services/auth/UserService';
import { AuthService } from './services/auth/AuthService';
import { UserSessionService } from './services/auth/UserSessionService';
import { PassportProviders } from './services/auth/PassportProviders';
import { AuthEmailService } from './services/auth/AuthEmailService';
import { BaseService } from './services/BaseService';

class ServiceRegistry {
  private servicesMap = new Map();
  private defaultService = new BaseService();

  public register<T extends BaseService> (type: new () => T) {
    if (!this.servicesMap.get(type)) {
      const service = new type();
      this.servicesMap.set(type, service);
    }
    return this;
  }

  public getService<T extends BaseService> (type: new () => T): T {
    const instance = this.servicesMap.get(type);
    return instance || this.defaultService;
  }

};

export const serviceRegistry = new ServiceRegistry();


