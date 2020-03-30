import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as passport from 'passport';
import { useExpressServer } from 'routing-controllers';

import { AppConfig } from './utils/Config';
import { TypeOrmManager } from './utils/TypeOrmManager';
import { headerMiddleware } from './middlewares/HeaderMiddleware';
import { errorMiddleware } from './middlewares/ErrorMiddleware';
import { refreshAccessToken } from './middlewares/AuthorizeMiddleware';
import { ClientAppConfig } from '@/ClientAppConfig';
import { logger } from './utils/Logger';
import { BaseController } from './controllers/BaseController';
import { AppController } from './controllers/AppController';
import { AuthController } from './controllers/user/AuthController';
import { UserController } from './controllers/user/UserController';
import { ExpressApplicationHooks } from './ExpressApplicationHooks';
import { AppUser } from './entities/users/AppUser';
import { AppUserSession } from './entities/users/AppUserSession';
import { AppUserSocialNetProfile } from './entities/users/AppUserSocialNetProfile';
import * as helmet from 'helmet';
import { ServiceRegistry } from './services/ServiceContainer';
import { UserService } from './services/user/UserService';
import { UserSessionService } from './services/user/UserSessionService';
import { AuthService } from './services/user/AuthService';
import { PassportProviders } from './services/user/PassportProviders';
import { AuthEmailService } from './services/user/AuthEmailService';
import { MediaService } from './services/MediaService';


export class ExpressApplication {
  private hooks: ExpressApplicationHooks = new ExpressApplicationHooks();
  private app = express();
  private appControllers: Array<typeof BaseController> = [AppController, AuthController, UserController];
  private ormEntityModelMetadata: any[] = [AppUser, AppUserSession, AppUserSocialNetProfile];

  public async start (appHooks?: ExpressApplicationHooks) {
    this.hooks = appHooks || new ExpressApplicationHooks();
    try {
      this.hooks.beforListen(this);
      this.app.listen(AppConfig.serverConfig.port, () => {
        logger.info(`Application has started in ${process.env.NODE_ENV} mode and listen at port ${AppConfig.serverConfig.port}`);
        this.hooks.afterListen(this);

        if (process.send) {
          process.send('ready');
          logger.info('Process.send ready');
        }
      });

      process.on('SIGINT', () => {
        this.hooks.onProcessStop(this);
        logger.info('Server SIGINT');
      });

      process.on('warning', e => logger.error(e.stack));

      return this.app;
    } catch (exc) {
      this.hooks.onListenError(this, exc);
      logger.error(exc);
      if (process.send) {
        process.send('stop');
      }
    }
  }

  public getExpressApp () {
    return this.app;
  }

  public getAppConfig () {
    return AppConfig;
  }

  public addAppControllers (controllers: Array<typeof BaseController>) {
    this.appControllers = [...this.appControllers, ...controllers];

    this.addOrmEntityModelMetadata([AppUser])

    а еще две смущности ?
      AppUserSession AppUserSocialNetProfile
  }

  public addOrmEntityModelMetadata (antityList: any[]) {
    this.ormEntityModelMetadata = [...this.ormEntityModelMetadata, ...antityList];
  }

  public getTypeOrmManager () {
    return TypeOrmManager;
  }

  public async initialize () {

    this.hooks.beforInitialize(this);

    ServiceRegistry.register(UserService).
      register(UserSessionService).
      register(AuthService).
      register(PassportProviders).
      register(AuthEmailService).
      register(MediaService);


    this.hooks.beforTypeOrmInitialize(this);
    if (!!AppConfig.typeOrm) {
      await TypeOrmManager.initConnection(AppConfig.typeOrm, this.ormEntityModelMetadata);
    }
    this.hooks.afterTypeOrmInitialize(this)

    this.app.set('trust proxy', 1);
    this.app.use(helmet());
    this.app.use(helmet.noCache());

    if (AppConfig.serverConfig.useCors) {
      this.app.use(cors());
    }

    const limit = AppConfig.serverConfig.bodyParserLimit || '50mb'
    this.app.use(bodyParser.urlencoded({ limit, extended: true }));
    this.app.use(bodyParser.json({ limit }));

    if (!!AppConfig.authConfig) {
      this.hooks.beforPassportInitialize(this);
      // FIXME: Через конфиг или отдельные методы
      ServiceRegistry.getService(PassportProviders).initialize(ClientAppConfig);
      this.app.use(passport.initialize());
      this.hooks.afterPassportInitialize(this);
      // FIXME: работу с токенами через конфиг (надо или нет)  или отдельные методы
      this.app.use(refreshAccessToken());
    }


    this.app.use(headerMiddleware());

    this.hooks.beforRoutingControllersInitialize(this)
    useExpressServer(this.app, {
      routePrefix: AppConfig.serverConfig.restApiEndPoint,
      controllers: this.appControllers
    });
    this.hooks.afterRoutingControllersInitialize(this);

    this.app.use(errorMiddleware());

    this.hooks.initialized(this);

    return this.app;
  }
}
