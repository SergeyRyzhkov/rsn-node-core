import { BaseController } from './BaseController';
import { Response } from 'express';
import ClientAppConfig from '@/ClientAppConfig';
import AppConfig from '@/utils/Config';
import { JsonController, Get, Res, getMetadataArgsStorage, UseBefore, Post, Put, Body } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi'
import { authorized } from '@/middlewares/AuthorizeMiddleware';
import RgisService from '@/services/RgisService';
import ServiceContainer from '@/services/ServiceContainer';

@JsonController('/app')
export default class AppController extends BaseController {

  @Get('/client/config')
  public async getClientAppConfig (@Res() response: Response) {
    return BaseController.createSuccessResponse(ClientAppConfig, response);
  }

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

  @Get('/rgis')
  public async Rgis (@Res() response: Response) {
    new RgisService().start();
    return BaseController.createSuccessResponse('', response);
  }

  @Post('/admin/proxy/list')
  public async updateProxies (@Res() response: Response) {
    ServiceContainer.ProxyService.updateProxies();
    return BaseController.createSuccessResponse({}, response);
  }

  @Get('/admin/proxy/list')
  public async getProxies (@Res() response: Response) {
    const result = await ServiceContainer.ProxyService.getProxies();
    return BaseController.createSuccessResponse(result, response);
  }

  @Put('/admin/proxy/request')
  public async sendRequest (
    @Res() response: Response,
    @Body() requestInfo: any,
  ) {
    const result = await ServiceContainer.ProxyService.sendRequest(requestInfo);
    return BaseController.createSuccessResponse(result, response);
  }
}

