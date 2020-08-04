import { BaseController } from './BaseController';
import { Response } from 'express';
import { AppConfig } from '@/utils/Config';
import { JsonController, Get, Res, getMetadataArgsStorage, UseBefore } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi'
import { authorized } from '@/middlewares/AuthorizeMiddleware';

@JsonController('/app')
export class AppController extends BaseController {

  @UseBefore(authorized())
  @Get('/spec')
  public async getApiSpec (@Res() response: Response) {
    const storage = getMetadataArgsStorage();
    const options = {
      defaultErrorHandler: true,
      routePrefix: AppConfig.serverConfig.restApiEndPoint
    }
    const spec = routingControllersToSpec(storage, options);
    return BaseController.createSuccessResponse(spec, response);
  }

  // FIXME: Сделать единый типизированный конфиг, через классы. AppConfig с возможностью получить конфиг, загрузить
  @UseBefore(authorized())
  @Get('/spec')
  public async reloadConfig (@Res() response: Response) {
    return BaseController.createSuccessResponse({}, response);
  }

}

