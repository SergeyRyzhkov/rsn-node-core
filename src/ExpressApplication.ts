import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as passport from 'passport';
import { useExpressServer } from 'routing-controllers';

import AppConfig from './utils/Config';
import TypeOrmManager from './utils/TypeOrmManager';
import { headerMiddleware } from './middlewares/HeaderMiddleware';
import { errorMiddleware } from './middlewares/ErrorMiddleware';
import ServiceContainer from './services/ServiceContainer';
import { refreshAccessToken } from './middlewares/AuthorizeMiddleware';
import ClientAppConfig from '@/ClientAppConfig';
import { logger } from './utils/Logger';
import { BaseController } from './controllers/BaseController';
import AppController from './controllers/AppController';
import AuthController from './controllers/user/AuthController';
import UserController from './controllers/user/UserController';
import ExpressApplicationHooks from './ExpressApplicationHooks';
import { AppUser } from './entities/users/AppUser';
import { AppUserSession } from './entities/users/AppUserSession';
import { AppUserSocialNetProfile } from './entities/users/AppUserSocialNetProfile';
import * as helmet from 'helmet';


export default class ExpressApplication {
  private hooks: ExpressApplicationHooks;
  private app = express();
  private appControllers: Array<typeof BaseController> = [AppController, AuthController, UserController];
  private ormEntityModelMetadata: any[] = [AppUser, AppUserSession, AppUserSocialNetProfile];

  public async start (appHooks?: ExpressApplicationHooks) {
    this.hooks = appHooks || new ExpressApplicationHooks();
    try {
      const port = process.env.PORT || AppConfig.serverConfig.port;

      appHooks.beforListen(this);
      const expressApp = await this.initialize();
      expressApp.listen(port, () => {
        appHooks.afterListen(this);
        if (process.send) {
          process.send('ready');
        }
      });

      process.on('SIGINT', () => {
        this.hooks.onProcessStop(this);
        logger.info('Server SIGINT');
      });

      return expressApp;
    } catch (exc) {
      appHooks.onListenError(this, exc);
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
  }

  public addOrmEntityModelMetadata (antityList: []) {
    this.ormEntityModelMetadata = [...this.ormEntityModelMetadata, ...antityList];
  }

  public getTypeOrmManager () {
    return TypeOrmManager;
  }

  private async initialize () {

    this.hooks.beforInitialize(this);

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

    this.hooks.beforPassportInitialize(this);
    // FIXME: Через конфиг или отдельные методы
    ServiceContainer.PassportProviders.initialize(ClientAppConfig);
    this.app.use(passport.initialize());
    this.hooks.afterPassportInitialize(this);

    // FIXME: работу с токенами через конфиг (надо или нет)  или отдельные методы
    this.app.use(refreshAccessToken());

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
