
import { UserService } from './user/UserService';
import { AuthService } from './user/AuthService';
import { UserSessionService } from './user/UserSessionService';
import { PassportProviders } from './user/PassportProviders';
import { AuthEmailService } from './user/AuthEmailService';
import { BaseService } from './BaseService';

class ServiceContainer {
  private servicesMap = new Map();
  private defaultService = new BaseService();

  public static UserService: UserService = new UserService();
  public static UserSessionService: UserSessionService = new UserSessionService();
  public static AuthService: AuthService = new AuthService();
  public static PassportProviders: PassportProviders = new PassportProviders();
  public static AuthEmailService: AuthEmailService = new AuthEmailService();

  public register<T extends BaseService> (type: new () => T) {
    const service = new type();
    this.servicesMap.set(type, service);
    return this;
  }

  public getService<T extends BaseService> (type: new () => T): T {
    const instance = this.servicesMap.get(type);
    return instance || this.defaultService;
  }

};

export const ServiceRegistry = new ServiceContainer();


