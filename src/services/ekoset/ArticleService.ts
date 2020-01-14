import * as path from 'path';
import * as fs from 'fs';
import * as slugify from '@sindresorhus/slugify';
import BaseService from '../BaseService';
import PgUtls from '@/utils/PgUtils';
import { Article } from '@/entities/ekoset/Article';
import TypeOrmManager from '@/utils/TypeOrmManager';
import Base64 from '@/utils/Base64';
import { logger } from '@/utils/Logger';
import * as cuid from 'cuid';
import SortFilterPagination from '@/entities/SortFilterPagination';
import { ClArticleTag } from '@/entities/ekoset/ClArticleTag';
import ServiceContainer from '../ServiceContainer';
import { isNullOrUndefined } from 'util';

export default class ArticleService extends BaseService {

  private regexp = /<img\ssrc="data:image\/([a-z]*?)\;base64\,(.*?)".*?>/gm;
  private apiAdminListViewName = 'v_api_admin_article_list';
  private apiListViewName = 'v_api_article_list';
  private apiViewName = 'v_api_article';
  private apiRelatedViewName = 'v_api_related_article';
  private apiBusinessServiceArticlesViewName = 'v_api_business_service_article';
  private apiSiteSectionArticlesViewName = 'v_api_site_section_article';
  private apiArticleTagsViewName = 'v_api_article_tag';

  // Все новости для админки
  public async adminGetAll () {
    return this.getDbViewResult(this.apiAdminListViewName);
  }

  // Добавить/Убрать тэг
  public async adminAddArticleTag (articleId: number, tagId: number) {
    const tryAddedTag = await PgUtls.getOneFromDatabse('article_cl_article_tag', 'article_id = $1 and cl_article_id=$2', [articleId, tagId]);
    if (!tryAddedTag) {
      const insertStmt = `INSERT INTO article_cl_article_tag (article_id, cl_article_id) VALUES (${articleId}, ${tagId})`;
      PgUtls.execNone(insertStmt);
    }

    return {}
  }

  public async adminDeleteArticleTag (articleId: number, tagID: number) {
    return PgUtls.delete('article_cl_article_tag', 'article_id = $1 AND cl_article_id = $2', [articleId, tagID])
  }

  // Все Тэги
  public async getAllArticleTags () {
    return this.getDbViewResult('cl_article_tag');
  }

  // Все Тэги
  public async saveArticleTag (tag: ClArticleTag) {
    return TypeOrmManager.EntityManager.save(tag);
  }

  // Тэги для статьи
  public async getArticleTags (articleId: number) {
    return this.getDbViewResult(this.apiArticleTagsViewName, null, 'article_id=$1', [articleId]);
  }

  // Тэги для статьи связи
  public async getArticleTagsRelation (articleId: number) {
    return this.execFunction('f_admin_article_tags_relation', [articleId]);
  }

  // Для стратовой страницы (нет связит с разделом)
  public async getForHomePage (pagination: SortFilterPagination) {
    return this.getDbViewResult(this.apiListViewName, pagination, 'site_section_id IS NULL AND article_status = 1');
  }

  // Для раздела сайта (есть связь с разделом, но не связаны с услугами)
  public async getBySiteSection (siteSectionId: number, pagination: SortFilterPagination) {
    return this.getDbViewResult(this.apiSiteSectionArticlesViewName, pagination, 'site_section_id = $1 AND article_status = 1', [siteSectionId]);
  }

  // Для конкретной услуги
  public async getByBusinessService (serviceId: number, pagination: SortFilterPagination) {
    return this.getDbViewResult(this.apiBusinessServiceArticlesViewName, pagination, 'business_service_id = $1 AND article_status = 1', [serviceId]);
  }

  // Для админки получиь связи статьи с услугами
  public async adminGetServiceRelation (siteSectionId: number, articleId: number) {
    return this.execFunction('f_admin_article_service', [articleId, siteSectionId]);
  }

  // Для админки установить\разорвать связи статьи с услугами
  public async adminAddServiceRelation (serviceId: number, articleId: number) {
    return this.execFunction('f_admin_add_article2service', [serviceId, articleId]);
  }

  public async adminRemoveServiceRelation (serviceId: number, articleId: number) {
    return this.execFunction('f_admin_remove_service_from_article', [serviceId, articleId]);
  }

  public async getById (id: number) {
    const updateStmt = 'update article set article_views_number=article_views_number+1 where article_id=$1';
    await PgUtls.execNone(updateStmt, [id])
    return this.getOneById(this.apiViewName, 'article_id = $1', id);
  }

  public async getRelated (id: number) {
    return this.getDbViewResult(this.apiRelatedViewName, null, 'main_article_id =$1 AND article_status = 1', [id]);
  }

  public async getCountBySiteSection (siteSectionId: number) {
    return this.getDbViewRowCount(this.apiSiteSectionArticlesViewName, 'site_section_id = $1 AND article_status = 1', [siteSectionId]);
  }

  public async getRootArticlesCount () {
    return this.getDbViewRowCount(this.apiListViewName, 'site_section_id IS NULL AND article_status = 1');
  }

  public async save (article: Article) {
    article.articlePublishDate = !article.articlePublishDate ? new Date(Date.now()).toUTCString() : article.articlePublishDate;
    try {
      // Заменяем встроенные картинки Base64 на URL
      article.articleBody = await this.createImageFromBase64AndReplaceSrc(article.articleBody);
      article.articleSlug = slugify(article.articleTitle);
      article.siteSection = Promise.resolve(article.siteSectionId);
      article.articleStatus = !isNullOrUndefined(article.articleStatus) ? article.articleStatus : 1;

      if (article.siteSectionId === null) {
        this.deleteById('business_service_article', 'article_id = $1', article.articleId);
      }

      return TypeOrmManager.EntityManager.save(article);
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  }

  public async delete (id: number) {
    return this.deleteById('article', 'article_id = $1', id);
  }

  private async createImageFromBase64AndReplaceSrc (articleBody: string) {
    let result = articleBody;
    const match = this.regexp.exec(articleBody);

    if (match) {
      const ext = match[1];
      const base64 = match[2];
      const imagePathAndFileName: string[] = ServiceContainer.MediaService.getImageFullPathAndFileName('news', 'img', ext);

      try {
        await Base64.decode(base64, imagePathAndFileName[0]);
        const imageSrc = `/img/news/${imagePathAndFileName[1]}`;
        result = articleBody.replace(`data:image/${ext};base64,`, '').replace(base64, imageSrc)
      } catch (err) {
        logger.error(err);
      }
    }
    return result;
  }

}
