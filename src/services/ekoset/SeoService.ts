
import BaseService from '../BaseService';

export default class SeoService extends BaseService {

  private apiSeoTagsViewName = 'v_api_seo_meta_tag';

  public async getForHomePage () {
    const result = await this.getDbViewResult(this.apiSeoTagsViewName, null, 'site_section_id IS NULL and site_section_id is null and ind_offer_id is null and article_id is null');
    return this.buildResult(result);
  }

  public async getBySiteSection (siteSectionId: number) {
    const result = await this.getDbViewResult(this.apiSeoTagsViewName, null, 'site_section_id = $1', [siteSectionId]);
    return this.buildResult(result);
  }

  public async getByIndividualOffer (id: number) {
    const result = await this.getDbViewResult(this.apiSeoTagsViewName, null, 'ind_offer_id = $1', [id]);
    return this.buildResult(result);
  }

  public async getByArticle (id: number) {
    const result = await this.getDbViewResult(this.apiSeoTagsViewName, null, 'article_id = $1', [id]);
    return this.buildResult(result);
  }

  public async getByBusinessService (id: number) {
    const result = await this.getDbViewResult(this.apiSeoTagsViewName, null, 'business_service_id = $1', [id]);
    return this.buildResult(result);
  }

  private buildResult (seoMetaTags) {
    const result: any = {};
    result.metaTags = [...seoMetaTags];
    result.pageTitle = '';

    result.metaTags.forEach((element: any) => {
      for (const key in element) {
        if (key.endsWith('Id')) {
          delete element[key];
        }
      }

      for (const key in element) {
        if (!element[key]) {
          delete element[key];
        }
      }

      if (element.name === 'Title') {
        result.pageTitle = element.content;
        delete element.name
      }
    })

    return result;
  }

}
