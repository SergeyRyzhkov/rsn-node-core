import { BaseController } from './BaseController';
import { Response } from 'express';
import { JsonController, Get, Res, getMetadataArgsStorage, UseBefore } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi'
import { authorized } from '@/middleware/SecurityMiddlewares';
import { ConfigManager } from '@/ConfigManager';
import { ExpressConfig } from '@/ExpressConfig';

@JsonController('/app')
export class AppController extends BaseController {

  private baseUrl = ConfigManager.instance.getOptions(ExpressConfig).restApiBaseUrl;

  @UseBefore(authorized())
  @Get('/spec')
  public async getApiSpec (@Res() response: Response) {
    const storage = getMetadataArgsStorage();
    const options = {
      defaultErrorHandler: true,
      routePrefix: this.baseUrl
    }
    const spec = routingControllersToSpec(storage, options);
    return this.createSuccessResponse(spec, response);
  }


  @UseBefore(authorized())
  @Get('/config')
  public async getServerConfig (@Res() response: Response) {
    const config = ConfigManager.instance.toJSON();
    return this.createSuccessResponse(config, response);
  }

}

// FIXME: Надо, если секьюрити модуль подключен сразу регистрировать энтити, сервисы, контроллеры
