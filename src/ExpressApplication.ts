import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { useExpressServer } from 'routing-controllers';
import noCache from 'nocache';
import { TypeOrmManager } from './utils/TypeOrmManager';
import { errorMiddleware } from './middleware/ErrorMiddleware';
import { logger } from './utils/Logger';
import { BaseController } from './controllers/BaseController';
import helmet from 'helmet';
import { verifyUpdateAccessToken } from './middleware/SecurityMiddlewares';
import cookieParser from 'cookie-parser';
import xss from 'xss-clean';
// import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { ExpressConfig } from './ExpressConfig';
import { ConfigManager } from './ConfigManager';
import { ServiceRegistry } from './ServiceRegistry';
import { AppController } from './controllers/AppController';
import { AuthController } from './controllers/security/AuthController';
import { RegistrationController } from './controllers/security/RegistrationController';
import { ResetPasswordController } from './controllers/security/ResetPasswordController';
import { AppUserService } from './services/security/user/AppUserService';
import { AppUserSessionService } from './services/security/user/AppUserSessionService';
import { AuthService } from './services/security/auth/AuthService';
import { RegistrationService } from './services/security/registration/RegistrationService';
import { ResetPasswordService } from './services/security/reset/ResetPasswordService';
import { AppUser } from './models/security/AppUser';
import { AppUserSession } from './models/security/AppUserSession';
import { AppUserSocialNetProfile } from './models/security/AppUserSocialNetProfile';
import { SecurityConfig } from './services/security/SecurityConfig';

// FIXME: Было бы удобно еще регистрировать массив сервисов

export class ExpressApplication {
  private config: ExpressConfig;
  private app = express();

  private appControllers: typeof BaseController[] = [];
  private ormEntityModelMetadata: any[] = [];

  constructor(config?: ExpressConfig) {
    this.config = config || ConfigManager.instance.getOptionsAsClass(ExpressConfig, "ExpressConfig");
    this.config = this.config || new ExpressConfig();
  }

  public getExpressApp () {
    return this.app;
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

      const server = this.app.listen(this.config.port, () => {
        logger.info(`Application has started in ${this.app.get('env')} mode and listen at port ${this.config.port}`);
        if (process.send) {
          process.send('ready');
          logger.info('Process.send ready');
        }
      });

      process.on('warning', e => logger.error(e.stack));

      process.on('unhandledRejection', (err) => {
        logger.error(err);
        server.close(() => process.exit(1))
      })

      return this.app;
    } catch (exc) {
      logger.error(exc);
      if (process.send) {
        process.send('stop');
      }
    }
  }

  private async initialize () {

    const limit = this.config.bodyParserLimit || '50mb';

    this.app.set('trust proxy', 1);
    // Prevent XSS attacks
    this.app.use(xss());
    // Prevent http param pollution
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(noCache());
    this.app.use(cookieParser())
    this.app.use(bodyParser.urlencoded({ limit, extended: true }));
    this.app.use(bodyParser.json({ limit }));

    // FIXME: Использовать через конфиг
    // Rate limiting
    // const limiter = rateLimit({
    //   windowMs: 10 * 60 * 1000, // 10 mins
    //   max: 100 // 100 request per 10 mins
    // })

    // app.use(limiter)

    if (this.config.useCors) {
      this.app.use(cors(
        this.config.corsOptions
      ));
    }

    if (ConfigManager.instance.exists("SecurityConfig")) {
      this.app.use(verifyUpdateAccessToken());

      ServiceRegistry.instance.register(AppUserService).
        register(AppUserSessionService).
        register(AuthService).
        register(RegistrationService).
        register(ResetPasswordService);

      // FIXME: Для них по хорошему надо также сделать Registry, а не сувать в App
      const entities = [AppUser, AppUserSession, AppUserSocialNetProfile];
      const controllers = [AppController, AuthController, RegistrationController, ResetPasswordController];
      this.addAppControllers(controllers).addTypeOrmEntityMetadata(entities);
    }

    if (ConfigManager.instance.exists("DatabaseConfig")) {
      await TypeOrmManager.initConnection(this.ormEntityModelMetadata);
    }

    useExpressServer(this.app, {
      routePrefix: this.config.restApiBaseUrl,
      controllers: this.appControllers,
      defaultErrorHandler: false
    });

    this.app.use(errorMiddleware());

    return this;
  }
}


