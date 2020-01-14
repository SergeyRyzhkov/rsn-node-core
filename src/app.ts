import * as express from 'express';
import * as cors from 'cors';
import * as responseTime from 'response-time';
import * as bodyParser from 'body-parser';
import * as passport from 'passport';
import * as compression from 'compression'
import helmet from 'helmet';
import 'reflect-metadata';
import { useExpressServer } from 'routing-controllers';

import AppConfig from './utils/Config';
import TypeOrmManager from './utils/TypeOrmManager';
import { headerMiddleware } from './middlewares/HeaderMiddleware';
import { errorMiddleware } from './middlewares/ErrorMiddleware';
import ServiceContainer from './services/ServiceContainer';
import { refreshAccessToken } from './middlewares/AuthorizeMiddleware';
import { appControllers } from './controllers';
import ClientAppConfig from '@/ClientAppConfig';

export default class Application {

  public async initialize () {
    const app = express();

    await TypeOrmManager.initConnection();
    await ServiceContainer.PassportProviders.initialize(ClientAppConfig);

    app.set('trust proxy', 1);
    app.use(helmet());
    app.use(helmet.noCache());

    if (AppConfig.serverConfig.useCors) {
      app.use(cors());
    }
    app.use(responseTime());
    // app.use(compression({ threshold: 0 }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    app.use(bodyParser.json({ limit: '50mb' }));

    app.use(passport.initialize());

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



