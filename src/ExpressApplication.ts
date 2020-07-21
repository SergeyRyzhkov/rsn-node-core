import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import passport from 'passport';
import { useExpressServer } from 'routing-controllers';
import noCache from 'nocache';

import { AppConfig } from './utils/Config';
import { TypeOrmManager } from './TypeOrmManager';
import { headerMiddleware } from './middlewares/HeaderMiddleware';
import { errorMiddleware } from './middlewares/ErrorMiddleware';
import { refreshAccessToken } from './middlewares/AuthorizeMiddleware';
import { ClientAppConfig } from '@/ClientAppConfig';
import { logger } from './utils/Logger';
import { BaseController } from './controllers/BaseController';
import { AppController } from './controllers/AppController';
import { AuthController } from './controllers/auth/AuthController';
import { UserController } from './controllers/auth/UserController';
import { ExpressApplicationHooks } from './ExpressApplicationHooks';
import { AppUser } from './entities/auth/AppUser';
import { AppUserSession } from './entities/auth/AppUserSession';
import { AppUserSocialNetProfile } from './entities/auth/AppUserSocialNetProfile';
import helmet from 'helmet';
import { serviceRegistry } from './ServiceRegistry';
import { UserService } from './services/auth/UserService';
import { UserSessionService } from './services/auth/UserSessionService';
import { AuthService } from './services/auth/AuthService';
import { PassportProviders } from './services/auth/PassportProviders';
import { AuthEmailService } from './services/auth/AuthEmailService';
import { MediaService } from './services/MediaService';


export class ExpressApplication {
  private hooks: ExpressApplicationHooks = new ExpressApplicationHooks();
  private app = express();
  private appControllers: typeof BaseController[] = [AppController, AuthController, UserController];
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

  public addAppControllers (controllers: typeof BaseController[]) {
    this.appControllers = [...this.appControllers, ...controllers];
  }

  public addTypeOrmEntityMetadata (antityList: any[]) {
    this.ormEntityModelMetadata = [...this.ormEntityModelMetadata, ...antityList];
  }

  public async initialize () {

    this.hooks.beforInitialize(this);

    serviceRegistry.register(UserService).
      register(UserSessionService).
      register(AuthService).
      register(PassportProviders).
      register(AuthEmailService).
      register(MediaService);

    this.hooks.beforTypeOrmInitialize(this);
    if (!!AppConfig.typeOrm) {
      await TypeOrmManager.initConnection(this.ormEntityModelMetadata);
    }
    this.hooks.afterTypeOrmInitialize(this)

    this.app.set('trust proxy', 1);
    this.app.use(helmet());
    this.app.use(noCache());

    if (AppConfig.serverConfig.useCors) {
      this.app.use(cors());
    }

    const limit = AppConfig.serverConfig.bodyParserLimit || '50mb'
    this.app.use(bodyParser.urlencoded({ limit, extended: true }));
    this.app.use(bodyParser.json({ limit }));

    if (!!AppConfig.authConfig) {
      this.hooks.beforPassportInitialize(this);
      // FIXME: Через конфиг или отдельные методы
      serviceRegistry.getService(PassportProviders).initialize(ClientAppConfig);
      this.app.use(passport.initialize());
      this.hooks.afterPassportInitialize(this);
      // FIXME: работу с токенами через конфиг (надо или нет)  или отдельные методы
      this.app.use(refreshAccessToken());
    }


    this.app.use(headerMiddleware());

    this.hooks.beforRoutingControllersInitialize(this);

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
