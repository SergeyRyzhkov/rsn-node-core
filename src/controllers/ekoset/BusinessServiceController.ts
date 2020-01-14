
import { JsonController, Get, Res, Param, Body, Put, Delete, QueryParam } from 'routing-controllers';
import { Response } from 'express';
import { BaseController } from '../BaseController';
import ServiceContainer from '@/services/ServiceContainer';
import { BusinessService } from '@/entities/ekoset/BusinessService';

@JsonController()
export default class BusinessServiceController extends BaseController {

  @Get('/services')
  public async getAll (
    @Res() response: Response) {
    const result = await ServiceContainer.BusinessServiceService.getAll();
    return BusinessServiceController.createSuccessResponse(result, response);
  }

  @Get('/services/start/main')
  public async getMainList (
    @Res() response: Response) {
    const result = await ServiceContainer.BusinessServiceService.getMainList();
    return BusinessServiceController.createSuccessResponse(result, response);
  }

  @Get('/:sitesection/services')
  public async getAllBySiteSectionId (
    @Res() response: Response,
    @Param('sitesection') siteSectionId: number,
    @QueryParam('root') excludeChild: boolean) {

    const result = await ServiceContainer.BusinessServiceService.getAllBySiteSectionId(siteSectionId, excludeChild);
    return BusinessServiceController.createSuccessResponse(result, response);
  }

  @Get('/admin/panel/:sitesection/services')
  public async adminGetAllBySiteSectionId (
    @Res() response: Response,
    @Param('sitesection') siteSectionId: number) {

    const result = await ServiceContainer.BusinessServiceService.adminGetAllBySiteSectionId(siteSectionId);
    return BusinessServiceController.createSuccessResponse(result, response);
  }


  @Get('/:sitesection/activity/:activityType/services')
  public async getByActivityAndBySiteSectionId (
    @Res() response: Response,
    @Param('sitesection') siteSectionId: number,
    @Param('activityType') activityTypeId: number,
    @QueryParam('root') excludeChild: boolean) {
    const result = await ServiceContainer.BusinessServiceService.getByActivityAndBySiteSectionId(siteSectionId, activityTypeId, excludeChild);
    return BusinessServiceController.createSuccessResponse(result, response);
  }

  @Get('/:sitesection/services/person')
  public async getForPrivatePersonBySiteSectionId (
    @Res() response: Response,
    @Param('sitesection') siteSectionId: number,
    @QueryParam('root') excludeChild: boolean) {
    const result = await ServiceContainer.BusinessServiceService.getForPrivatePersonBySiteSectionId(siteSectionId, excludeChild);
    return BusinessServiceController.createSuccessResponse(result, response);
  }

  @Get('/:sitesection/services/business')
  public async getForBusinessBySiteSectionId (
    @Res() response: Response,
    @Param('sitesection') siteSectionId: number,
    @QueryParam('root') excludeChild: boolean) {
    const result = await ServiceContainer.BusinessServiceService.getForBusinessBySiteSectionId(siteSectionId, excludeChild);
    return BusinessServiceController.createSuccessResponse(result, response);
  }

  @Get('/services/footer/private')
  public async getFooterServicesForPrivateClient (
    @Res() response: Response
  ) {
    const result = await ServiceContainer.BusinessServiceService.getFooterServicesForPrivateClient();
    return BusinessServiceController.createSuccessResponse(result, response);
  }


  @Get('/services/footer/business')
  public async getFooterServicesForBusinessClient (
    @Res() response: Response
  ) {
    const result = await ServiceContainer.BusinessServiceService.getFooterServicesForBusinessClient();
    return BusinessServiceController.createSuccessResponse(result, response);
  }

  @Get('/services/:service/children')
  public async getChildServicesByParentId (
    @Res() response: Response,
    @Param('service') parentServiceId: number) {
    const result = await ServiceContainer.BusinessServiceService.getChildServicesByParentId(parentServiceId);
    return BusinessServiceController.createSuccessResponse(result, response);
  }

  @Get('/admin/panel/services/:service/children')
  public async adminGetChildServicesByParentId (
    @Res() response: Response,
    @Param('service') parentServiceId: number) {
    const result = await ServiceContainer.BusinessServiceService.adminGetChildServicesByParentId(parentServiceId);
    return BusinessServiceController.createSuccessResponse(result, response);
  }

  @Get('/services/:service')
  public async getById (
    @Res() response: Response,
    @Param('service') serviceId: number,
  ) {
    const result = await ServiceContainer.BusinessServiceService.getById(serviceId);
    return BusinessServiceController.createSuccessResponse(result, response);
  }

  @Put('/services')
  public async save (
    @Body() businessService: BusinessService,
    @Res() response: Response) {
    const result = await ServiceContainer.BusinessServiceService.save(businessService);
    return BusinessServiceController.createSuccessResponse(result, response);
  }

  @Delete('/services/:id(\\d+)')
  public async delete (
    @Param('id') id: number,
    @Res() response: Response) {
    const result = await ServiceContainer.BusinessServiceService.delete(id);
    return BusinessServiceController.createSuccessResponse(result, response);
  }


  @Get('/admin/panel/service/:serviceId/clActivities')
  public async getAdminСlActivitiesForService (
    @Res() response: Response,
    @Param('serviceId') serviceId: number) {
    const result = await ServiceContainer.BusinessServiceService.getAdminСlActivitiesForService(serviceId);
    return BusinessServiceController.createSuccessResponse(result, response);
  }

  @Get('/admin/panel/service/:serviceId/clclient')
  public async getAdminclClientsForService (
    @Res() response: Response,
    @Param('serviceId') serviceId: number) {
    const result = await ServiceContainer.BusinessServiceService.getAdminclClientsForService(serviceId);
    return BusinessServiceController.createSuccessResponse(result, response);
  }

  @Put('/admin/panel/services/:id/clienttype/person')
  public async setPrivatePerson2Service (
    @Param('id') id: number,
    @Res() response: Response) {
    const result = await ServiceContainer.BusinessServiceService.setPrivatePerson2Service(id);
    return BusinessServiceController.createSuccessResponse(result, response);
  }

  @Put('/admin/panel/services/:id/clienttype/business')
  public async setBusinessType2Service (
    @Param('id') id: number,
    @Res() response: Response) {
    const result = await ServiceContainer.BusinessServiceService.setBusinessType2Service(id);
    return BusinessServiceController.createSuccessResponse(result, response);
  }

  @Put('/admin/panel/services/:id/activitytype/:typeid')
  public async setActivityType2Service (
    @Param('id') id: number,
    @Param('typeid') typeid: number,
    @Res() response: Response) {
    const result = await ServiceContainer.BusinessServiceService.setActivityType2Service(id, typeid);
    return BusinessServiceController.createSuccessResponse(result, response);
  }

  @Delete('/admin/panel/services/:id/clienttype/person')
  public async removePrivatePersonFromService (
    @Param('id') id: number,
    @Res() response: Response) {
    const result = await ServiceContainer.BusinessServiceService.removePrivatePersonFromService(id);
    return BusinessServiceController.createSuccessResponse(result, response);
  }

  @Delete('/admin/panel/services/:id/clienttype/business')
  public async removeBusinessTypeFromService (
    @Param('id') id: number,
    @Res() response: Response) {
    const result = await ServiceContainer.BusinessServiceService.removeBusinessTypeFromService(id);
    return BusinessServiceController.createSuccessResponse(result, response);
  }

  @Delete('/admin/panel/services/:id/activitytype/:typeid')
  public async removeActivityTypeFromService (
    @Param('id') id: number,
    @Param('typeid') typeid: number,
    @Res() response: Response) {
    const result = await ServiceContainer.BusinessServiceService.removeActivityTypeFromService(id, typeid);
    return BusinessServiceController.createSuccessResponse(result, response);
  }

}
