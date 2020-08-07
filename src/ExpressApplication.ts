import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { useExpressServer } from 'routing-controllers';
import noCache from 'nocache';
import { AppConfig } from './utils/Config';
import { TypeOrmManager } from './TypeOrmManager';
import { headerMiddleware } from './middleware/HeaderMiddleware';
import { errorMiddleware } from './middleware/ErrorMiddleware';
import { logger } from './utils/Logger';
import { BaseController } from './controllers/BaseController';
import helmet from 'helmet';
import session from 'express-session';
import { verifyAndUpdateAccessToken } from './middleware/SecurityMiddlewares';
import cookieParser from 'cookie-parser';

// FIXME: Было бы удобно еще регистрировать массив сервисов

export class ExpressApplication {
  private app = express();

  private appControllers: typeof BaseController[] = [];
  private ormEntityModelMetadata: any[] = [];

  public getExpressApp () {
    return this.app;
  }

  public getAppConfig () {
    return AppConfig;
  }

  public addAppControllers (controllers: typeof BaseController[]) {
    this.appControllers = [...this.appControllers, ...controllers];
    return this;
  }

  public addTypeOrmEntityMetadata (antityList: any[]) {
    this.ormEntityModelMetadata = [...this.ormEntityModelMetadata, ...antityList];
    return this;
  }

  public async start () {
    try {
      await this.initialize();

      this.app.listen(AppConfig.serverConfig.port, () => {
        logger.info(`Application has started in ${this.app.get('env')} mode and listen at port ${AppConfig.serverConfig.port}`);
        if (process.send) {
          process.send('ready');
          logger.info('Process.send ready');
        }
      });

      process.on('warning', e => logger.error(e.stack));

      return this.app;
    } catch (exc) {
      logger.error(exc);
      if (process.send) {
        process.send('stop');
      }
    }
  }

  private async initialize () {
    if (!!AppConfig.dbConfig) {
      await TypeOrmManager.initConnection(this.ormEntityModelMetadata);
    }

    const limit = AppConfig.serverConfig.bodyParserLimit || '50mb'

    this.app.set('trust proxy', 1);
    this.app.use(helmet());
    this.app.use(noCache());
    this.app.use(cookieParser())
    this.app.use(bodyParser.urlencoded({ limit, extended: true }));
    this.app.use(bodyParser.json({ limit }));


    // FIXME: Параметры в конфиг
    if (AppConfig.serverConfig.useCors) {
      this.app.use(cors(
        {
          credentials: true,
          origin: true
        }
      ));
    }

    // Для работы с сессией
    // FIXME: В настройки все
    const sessionOptions = {
      secret: 'keyboard cat',
      resave: true,
      saveUninitialized: false,
      cookie: {
        secure: this.app.get('env') === 'production',
        sameSite: true,
        maxAge: AppConfig.authConfig.JWT.refresh.options.expiresIn * 1000
      }
    }
    this.app.use(session(sessionOptions));

    this.app.use(headerMiddleware());

    if (!!AppConfig.authConfig) {
      //  serviceRegistry.getService(PassportProviders).initialize();
      // this.app.use(passport.initialize());

      this.app.use(verifyAndUpdateAccessToken());
    }

    useExpressServer(this.app, {
      routePrefix: AppConfig.serverConfig.restApiEndPoint,
      controllers: this.appControllers,
      defaultErrorHandler: false
    });

    this.app.use(errorMiddleware());

    return this;
  }
}


// var app = express()
// app.set('trust proxy', 1) // trust first proxy
// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: true }
// }))