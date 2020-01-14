
import UserService from './user/UserService';
import AuthService from './user/AuthService';
import UserSessionService from './user/UserSessionService';
import PassportProviders from './user/PassportProviders';
import AuthEmailService from './user/AuthEmailService';

class ServiceContainer {
  public static UserService: UserService = new UserService();
  public static UserSessionService: UserSessionService = new UserSessionService();
  public static AuthService: AuthService = new AuthService();
  public static PassportProviders: PassportProviders = new PassportProviders();
  public static AuthEmailService: AuthEmailService = new AuthEmailService();
}

export default ServiceContainer;
