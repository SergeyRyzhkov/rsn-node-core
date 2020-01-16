import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as passport from 'passport';
import helmet from 'helmet';
import { useExpressServer } from 'routing-controllers';

import AppConfig from './utils/Config';
import TypeOrmManager from './utils/TypeOrmManager';
import { headerMiddleware } from './middlewares/HeaderMiddleware';
import { errorMiddleware } from './middlewares/ErrorMiddleware';
import ServiceContainer from './services/ServiceContainer';
import { refreshAccessToken } from './middlewares/AuthorizeMiddleware';
import { appControllers } from './controllers';
import ClientAppConfig from '@/ClientAppConfig';
import { logger } from './utils/Logger';

export default class ExpressApplication {

  public async start () {
    try {
      const expressApp = await this.initialize();
      const port = process.env.PORT || AppConfig.serverConfig.port;
      expressApp.listen(port);
      logger.info(`Server running on port ${port} in ${process.env.NODE_ENV}`);
      process.send('ready');
    } catch (exc) {
      logger.error(exc);
      process.send('stop');
    }
  }

  private async initialize () {
    const app = express();

    // FIXME: Через конфиг или отдельные методы
    await TypeOrmManager.initConnection();
    ServiceContainer.PassportProviders.initialize(ClientAppConfig);

    app.set('trust proxy', 1);
    app.use(helmet());
    app.use(helmet.noCache());

    if (AppConfig.serverConfig.useCors) {
      app.use(cors());
    }
    // app.use(responseTime());
    // app.use(compression({ threshold: 0 }));
    // FIXME: Размер через конфиг
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    app.use(bodyParser.json({ limit: '50mb' }));

    app.use(passport.initialize());

    // FIXME: работу с токенами через конфиг (надо или нет)  или отдельные методы
    app.use(refreshAccessToken());
    app.use(headerMiddleware());

    useExpressServer(app, {
      routePrefix: AppConfig.serverConfig.restApiEndPoint,
      controllers: appControllers
    });

    app.use(errorMiddleware());

    return app;
  }
}



