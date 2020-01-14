import { JsonController, Get, Res, Param, Req, Body, Put, Delete, Post } from 'routing-controllers';
import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import ServiceContainer from '@/services/ServiceContainer';
import { Article } from '@/entities/ekoset/Article';
import { NotFound } from '@/exceptions/clientErrors/NotFound';
import SortFilterPagination from '@/entities/SortFilterPagination';
import { SortFilterPaginationFromRequest } from '../AppController';
import { ClArticleTag } from '@/entities/ekoset/ClArticleTag';
import { isNullOrUndefined } from 'util';

@JsonController()
export default class ArticleController extends BaseController {

  @Get('/admin/panel/news')
  public async adminGetAll (
    @Res() response: Response
  ) {
    const result = await ServiceContainer.ArticleService.adminGetAll();
    return ArticleController.createSuccessResponse(result, response);
  }

  @Get('/admin/panel/news/:artcicleId(\\d+)/:siteSectionId/service')
  public async adminGetServiceRelation (
    @Res() response: Response,
    @Param('siteSectionId') siteSectionId: number,
    @Param('artcicleId') artcicleId: number) {

    const result = await ServiceContainer.ArticleService.adminGetServiceRelation(siteSectionId, artcicleId);
    return ArticleController.createSuccessResponse(result, response);
  }


  @Put('/admin/panel/news/:artcicleId/service/:serviceId')
  public async adminAddServiceRelation (
    @Res() response: Response,
    @Param('serviceId') serviceId: number,
    @Param('artcicleId') artcicleId: number) {

    const result = await ServiceContainer.ArticleService.adminAddServiceRelation(serviceId, artcicleId);
    return ArticleController.createSuccessResponse(result, response);
  }

  @Delete('/admin/panel/news/:artcicleId/service/:serviceId')
  public async adminRemoveServiceRelation (
    @Param('artcicleId') artcicleId: number,
    @Param('serviceId') serviceId: number,
    @Res() response: Response) {

    const result = ServiceContainer.ArticleService.adminRemoveServiceRelation(serviceId, artcicleId);
    return ArticleController.createSuccessResponse(result, response);
  }

  @Get('/admin/panel/news/:artcicleId(\\d+)/tags')
  public async getArticleTagsRelation (
    @Res() response: Response,
    @Param('artcicleId') artcicleId: number) {

    const result = await ServiceContainer.ArticleService.getArticleTagsRelation(artcicleId);
    return ArticleController.createSuccessResponse(result, response);
  }


  @Get('/admin/panel/news/tags')
  public async getAllArticleTags (
    @Res() response: Response) {
    const result = await ServiceContainer.ArticleService.getAllArticleTags();
    return ArticleController.createSuccessResponse(result, response);
  }

  @Post('/admin/panel/news/:artcicleId/tags/:tagId')
  public async adminAddArticleTag (
    @Param('tagId') tagId: number,
    @Param('artcicleId') artcicleId: number,
    @Res() response: Response) {

    const result = await ServiceContainer.ArticleService.adminAddArticleTag(artcicleId, tagId);
    return ArticleController.createSuccessResponse(result, response);
  }

  @Post('/admin/panel/news/tags')
  public async saveArticleTag (
    @Body() clArticleTag: ClArticleTag,
    @Res() response: Response) {

    const result = await ServiceContainer.ArticleService.saveArticleTag(clArticleTag);
    return ArticleController.createSuccessResponse(result, response);
  }

  @Delete('/admin/panel/news/:artcicleId/tags/:tagId')
  public async adminRemoveArticleTag (
    @Param('tagId') tagId: number,
    @Param('artcicleId') artcicleId: number,
    @Res() response: Response) {

    const result = await ServiceContainer.ArticleService.adminDeleteArticleTag(artcicleId, tagId);
    return ArticleController.createSuccessResponse(result, response);
  }

  @Get('/news')
  public async getRootArticles (
    @Res() response: Response,
    @SortFilterPaginationFromRequest() sortFilterPang: SortFilterPagination

  ) {

    const result = await ServiceContainer.ArticleService.getForHomePage(sortFilterPang);
    return ArticleController.createSuccessResponse(result, response);
  }

  @Get('/:sitesection/news')
  public async getArticlesBySiteSection (
    @Res() response: Response,
    @Param('sitesection') siteSectionId: number,
    @SortFilterPaginationFromRequest() sortFilterPang: SortFilterPagination) {

    const result = await ServiceContainer.ArticleService.getBySiteSection(siteSectionId, sortFilterPang);
    return ArticleController.createSuccessResponse(result, response);
  }

  @Get('/:sitesection/news/count')
  public async getArticlesCountSiteSection (
    @Res() response: Response,
    @Param('sitesection') siteSectionId: number) {

    const result = await ServiceContainer.ArticleService.getCountBySiteSection(siteSectionId);
    return ArticleController.createSuccessResponse(result, response);
  }

  @Get('/news/count')
  public async getRootArticlesCount (
    @Res() response: Response) {

    const result = await ServiceContainer.ArticleService.getRootArticlesCount();
    return ArticleController.createSuccessResponse(result, response);
  }

  @Get('/services/:service(\\d+)/news')
  public async getByBusinessService (
    @Res() response: Response,
    @Param('service') serviceId: number,
    @SortFilterPaginationFromRequest() sortFilterPang: SortFilterPagination) {

    const result = await ServiceContainer.ArticleService.getByBusinessService(serviceId, sortFilterPang);
    return ArticleController.createSuccessResponse(result, response);
  }

  @Get('/news/:id(\\d+)')
  public async getArticlesById (
    @Req() request: Request,
    @Res() response: Response,
    @Param('id') id: number) {

    const result = await ServiceContainer.ArticleService.getById(id);
    if (!isNullOrUndefined(result)) {
      return ArticleController.createSuccessResponse(result, response);
    } else {
      return ArticleController.createFailureResponse(new NotFound(request.originalUrl), response)
    }
  }

  @Get('/news/:id(\\d+)/related')
  public async getRelatedArticlesListById (
    @Res() response: Response,
    @Param('id') id: number) {

    const result = await ServiceContainer.ArticleService.getRelated(id);
    return ArticleController.createSuccessResponse(result, response);
  }


  @Get('/news/:id(\\d+)/tags')
  public async getArticleTags (
    @Res() response: Response,
    @Param('id') id: number) {

    const result = await ServiceContainer.ArticleService.getArticleTags(id);
    return ArticleController.createSuccessResponse(result, response);
  }

  @Put('/news')
  public async saveArticle (
    @Body() article: Article,
    @Res() response: Response) {

    const result = await ServiceContainer.ArticleService.save(article);
    return ArticleController.createSuccessResponse(result, response);
  }

  @Delete('/news/:id(\\d+)')
  public async deleteArticle (
    @Param('id') id: number,
    @Res() response: Response) {

    const result = await ServiceContainer.ArticleService.delete(id);
    return ArticleController.createSuccessResponse(result, response);
  }
}
