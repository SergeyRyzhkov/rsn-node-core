import { JsonController } from 'routing-controllers/decorator/JsonController';
import { BaseController } from '../BaseController';
import { Get, Res, Param } from 'routing-controllers';
import { Request, Response } from 'express';
import ServiceContainer from '@/services/ServiceContainer';

@JsonController()
export default class SeoController extends BaseController {

  @Get('/seometa')
  public async getForHomePage (
    @Res() response: Response) {

    const result = await ServiceContainer.SeoService.getForHomePage();
    return SeoController.createSuccessResponse(result, response);
  }

  @Get('/seometa/sitesections/:sitesection')
  public async getBySiteSection (
    @Res() response: Response,
    @Param('sitesection') siteSectionId: number) {

    const result = await ServiceContainer.SeoService.getBySiteSection(siteSectionId);
    return SeoController.createSuccessResponse(result, response);
  }

  @Get('/seometa/offers/:offer')
  public async getByIndividualOffer (
    @Res() response: Response,
    @Param('offer') offerId: number) {

    const result = await ServiceContainer.SeoService.getByIndividualOffer(offerId);
    return SeoController.createSuccessResponse(result, response);
  }


  @Get('/seometa/articles/:article')
  public async getByArticle (
    @Res() response: Response,
    @Param('article') articleId: number) {

    const result = await ServiceContainer.SeoService.getByArticle(articleId);
    return SeoController.createSuccessResponse(result, response);
  }

  @Get('/seometa/services/:service')
  public async getByBusinessService (
    @Res() response: Response,
    @Param('service') serviceId: number) {

    const result = await ServiceContainer.SeoService.getByBusinessService(serviceId);
    return SeoController.createSuccessResponse(result, response);
  }
}
