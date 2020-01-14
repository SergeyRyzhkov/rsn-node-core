
import { JsonController, Get, Res, Param, Body, Put, Delete } from 'routing-controllers';
import { Response } from 'express';
import { BaseController } from '../BaseController';
import ServiceContainer from '@/services/ServiceContainer';
import { IndividualOffer } from '@/entities/ekoset/IndividualOffer';

@JsonController()
export default class IndividualOfferController extends BaseController {

  // Админка
  @Put('/offers')
  public async save (
    @Body() individualOffer: IndividualOffer,
    @Res() response: Response) {
    const result = await ServiceContainer.IndividualOfferService.save(individualOffer);
    return IndividualOfferController.createSuccessResponse(result, response);
  }

  @Delete('/offers/:id(\\d+)')
  public async delete (
    @Param('id') id: number,
    @Res() response: Response) {
    const result = await ServiceContainer.IndividualOfferService.delete(id);
    return IndividualOfferController.createSuccessResponse(result, response);
  }

  @Get('/admin/panel/offers')
  public async adminGetAll (
    @Res() response: Response,
  ) {
    const result = await ServiceContainer.IndividualOfferService.adminGetAll();
    return IndividualOfferController.createSuccessResponse(result, response);
  }
  //

  @Get('/offers')
  public async getAll (
    @Res() response: Response) {
    const result = await ServiceContainer.IndividualOfferService.getAll();
    return IndividualOfferController.createSuccessResponse(result, response);
  }


  @Get('/:sitesection/offers')
  public async getAllBySiteSectionId (
    @Res() response: Response,
    @Param('sitesection') siteSectionId: number) {
    const result = await ServiceContainer.IndividualOfferService.getAllBySiteSectionId(siteSectionId);
    return IndividualOfferController.createSuccessResponse(result, response);
  }

  @Get('/admin/panel/:sitesection/offers')
  public async adminGetAllBySiteSectionId (
    @Res() response: Response,
    @Param('sitesection') siteSectionId: number) {
    const result = await ServiceContainer.IndividualOfferService.adminGetAllBySiteSectionId(siteSectionId);
    return IndividualOfferController.createSuccessResponse(result, response);
  }

  @Get('/:sitesection/activity/offers')
  public async getForActivityBySiteSectionId (
    @Res() response: Response,
    @Param('sitesection') siteSectionId: number) {
    const result = await ServiceContainer.IndividualOfferService.getForActivityBySiteSectionId(siteSectionId);
    return IndividualOfferController.createSuccessResponse(result, response);
  }


  @Get('/:sitesection/clients/offers')
  public async getForClientBySiteSectionId (
    @Res() response: Response,
    @Param('sitesection') siteSectionId: number) {
    const result = await ServiceContainer.IndividualOfferService.getForClientBySiteSectionId(siteSectionId);
    return IndividualOfferController.createSuccessResponse(result, response);
  }

  @Get('/:sitesection/offers/person')
  public async getForPrivatePersonBySiteSectionId (
    @Res() response: Response,
    @Param('sitesection') siteSectionId: number) {
    const result = await ServiceContainer.IndividualOfferService.getForPrivatePersonBySiteSectionId(siteSectionId);
    return IndividualOfferController.createSuccessResponse(result, response);
  }

  @Get('/:sitesection/offers/business')
  public async getForBusinessBySiteSectionId (
    @Res() response: Response,
    @Param('sitesection') siteSectionId: number) {
    const result = await ServiceContainer.IndividualOfferService.getForBusinessBySiteSectionId(siteSectionId);
    return IndividualOfferController.createSuccessResponse(result, response);
  }

  @Get('/offers/:offer')
  public async getById (
    @Res() response: Response,
    @Param('offer') offerId: number,
  ) {
    const result = await ServiceContainer.IndividualOfferService.getById(offerId);
    return IndividualOfferController.createSuccessResponse(result, response);
  }
}
