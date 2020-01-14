import BaseService from './BaseService';
import DynamicComponentInfo from '@/entities/DynamicComponentInfo';
import SitePage, { SitePageType } from '@/entities/ekoset/SitePage';
import TypeOrmManager from '@/utils/TypeOrmManager';
import * as slugify from '@sindresorhus/slugify';

export default class CMSService extends BaseService {

  private apiViewName = 'v_api_admin_site_block_info'
  private apiSitePageViewName = 'v_api_site_page'

  public async adminGetSitePages () {
    return this.getDbViewResult(this.apiSitePageViewName);
  }

  public async adminGetSitePageById (sitePageId: number) {
    return this.getOneById(this.apiSitePageViewName, 'site_page_id = $1', sitePageId);
  }

  public async adminGetSitePageByCode (sitePageCode: number) {
    return this.getOneById(this.apiSitePageViewName, 'site_page_code = $1', sitePageCode);
  }

  public async adminSaveSitePage (sitePage: SitePage) {
    if (sitePage.sitePageId > 10) {
      sitePage.sitePageRouteName = 'custom-page';
    }
    sitePage.sitePageMenuName = slugify(sitePage.sitePageName);
    return TypeOrmManager.EntityManager.save(sitePage);
  }

  public async adminDeleteSitePage (sitePageId: number) {
    return this.deleteById('site_page', 'site_page_id = $1', sitePageId);
  }

  public async adminGetDynamicComponentsInfoSitePage (sitePageId: number) {
    const result = await this.getDbViewResult(this.apiViewName, null, 'site_page_id = $1', [sitePageId]);
    let blockInfoList = this.getDynamicComponentInfoFromDataBase(result);

    const getBlockIndex = (infoList: DynamicComponentInfo[], code: number) => {
      return infoList.findIndex((iter) => {
        return iter.code === code;
      })
    }

    const removeBlock = (infoList: DynamicComponentInfo[], code: number) => {
      const newBlockList = [...infoList];
      const blockIndex = getBlockIndex(infoList, code)
      if (blockIndex > -1) {
        newBlockList.splice(blockIndex, 1);
      }
      return newBlockList;
    }

    blockInfoList = removeBlock(blockInfoList, BlockType.BUSINESSTYPE_OFFER);
    blockInfoList = removeBlock(blockInfoList, BlockType.CLIENTTYPE_OFFER);

    switch (sitePageId) {

      case SitePageType.ABOUT: {
        let resultBlockList = removeBlock(blockInfoList, BlockType.SERVICE_LIST);
        resultBlockList = removeBlock(resultBlockList, BlockType.SERVICE_PRICE);
        return resultBlockList;
      }

      case SitePageType.CLIENTS: {
        let resultBlockList = removeBlock(blockInfoList, BlockType.SERVICE_LIST);
        resultBlockList = removeBlock(resultBlockList, BlockType.SERVICE_PRICE);
        resultBlockList = removeBlock(resultBlockList, BlockType.NEWS);
        return resultBlockList;
      }

      case SitePageType.CONTACTS: {
        let resultBlockList = removeBlock(blockInfoList, BlockType.SERVICE_LIST);
        resultBlockList = removeBlock(resultBlockList, BlockType.SERVICE_PRICE);
        resultBlockList = removeBlock(resultBlockList, BlockType.NEWS);
        return resultBlockList;
      }

      case SitePageType.MAIN: {
        return blockInfoList;
      }

      case SitePageType.NEWS: {
        let resultBlockList = removeBlock(blockInfoList, BlockType.SERVICE_LIST);
        resultBlockList = removeBlock(resultBlockList, BlockType.SERVICE_PRICE);
        resultBlockList = removeBlock(resultBlockList, BlockType.LETTERS);
        resultBlockList = removeBlock(resultBlockList, BlockType.BRANDS);
        return resultBlockList;
      }

      case SitePageType.PRICES: {
        let resultBlockList = removeBlock(blockInfoList, BlockType.SERVICE_LIST);
        // let resultBlockList = removeBlock(blockInfoList, BlockType.SERVICE_PRICE);
        resultBlockList = removeBlock(resultBlockList, BlockType.NEWS);
        return resultBlockList;
      }

      default: {
        return blockInfoList;
      }
    }
  }

  public async adminGetDynamicComponentsInfoSiteSection (siteSectionId: number) {
    const result = await this.getDbViewResult(this.apiViewName, null, 'site_section_id = $1', [siteSectionId]);
    return this.getDynamicComponentInfoFromDataBase(result);
  }

  public async adminGetDynamicComponentsInfoService (serviceId: number) {
    const result = await this.getDbViewResult(this.apiViewName, null, 'business_service_id = $1', [serviceId]);
    return this.getDynamicComponentInfoFromDataBase(result);
  }

  public async adminGetDynamicComponentsInfoOffer (indOfferId: number) {
    const result = await this.getDbViewResult(this.apiViewName, null, 'ind_offer_id = $1', [indOfferId]);
    return this.getDynamicComponentInfoFromDataBase(result);
  }

  // ---

  public async adminSaveDynamicComponentsSitePage (sitePageId: number, infos: DynamicComponentInfo[]) {
    if (!!infos) {
      const promises = [];
      infos.forEach(
        (iterComponentInfo) => {
          const pr = this.adminSaveDynamicComponentSitePage(sitePageId, iterComponentInfo);
          promises.push(pr);
        })

      await Promise.all(promises);
      return {}
    }
    return {}
  }
  public async adminSaveDynamicComponentSitePage (sitePageId: number, info: DynamicComponentInfo) {
    return this.execAddBlockUnfoDbFunction('f_admin_add_block_info_page', sitePageId, info);
  }


  public async adminSaveDynamicComponentsSiteSection (siteSectionId: number, infos: DynamicComponentInfo[]) {
    if (!!infos) {
      const promises = [];
      infos.forEach(
        (iterComponentInfo) => {
          const pr = this.adminSaveDynamicComponentSiteSection(siteSectionId, iterComponentInfo);
          promises.push(pr);
        })

      await Promise.all(promises);
      return {}
    }
    return {}
  }

  public async adminSaveDynamicComponentSiteSection (siteSectionId: number, info: DynamicComponentInfo) {
    return this.execAddBlockUnfoDbFunction('f_admin_add_block_info_sitesection', siteSectionId, info);
  }

  public async adminSaveDynamicComponentsOffer (offerId: number, infos: DynamicComponentInfo[]) {
    if (!!infos) {
      const promises = [];
      infos.forEach(
        (iterComponentInfo) => {
          const pr = this.adminSaveDynamicComponentOffer(offerId, iterComponentInfo);
          promises.push(pr);
        })

      await Promise.all(promises);
      return {}
    }
    return {}
  }

  public async adminSaveDynamicComponentOffer (offerId: number, info: DynamicComponentInfo) {
    return this.execAddBlockUnfoDbFunction('f_admin_add_block_info_offer', offerId, info);
  }

  public async adminSaveDynamicComponentsService (serviceId: number, infos: DynamicComponentInfo[]) {
    if (!!infos) {
      const promises = [];
      infos.forEach(
        (iterComponentInfo) => {
          const pr = this.adminSaveDynamicComponentService(serviceId, iterComponentInfo);
          promises.push(pr);
        })

      await Promise.all(promises);
      return {}
    }
    return {}
  }

  public async adminSaveDynamicComponentService (serviceId: number, info: DynamicComponentInfo) {
    return this.execAddBlockUnfoDbFunction('f_admin_add_block_info_service', serviceId, info);
  }

  public async adminDeleteDynamicComponent (id: number) {
    return await this.deleteById('site_block', 'site_block_id=$1', id);
  }

  public adminGetDynamicComponentsInfoDefault () {
    const result: DynamicComponentInfo[] = [];

    const brandList = new DynamicComponentInfo();
    brandList.id = 0;
    brandList.code = BlockType.BRANDS;
    brandList.head = 'Нас рекомендуют';
    brandList.headCentered = true;
    brandList.dispalyName = 'Нас рекомендуют';
    brandList.name = 'RecommendationList';
    brandList.visible = 1;
    brandList.visibleIndex = 3;
    brandList.props = {
      brandList: []
    }


    const letters = new DynamicComponentInfo();
    letters.id = 0;
    letters.code = BlockType.LETTERS;
    letters.head = 'Благодарственные письма';
    letters.headCentered = true;
    letters.dispalyName = 'Благодарственные письма';
    letters.name = 'RecommLetterList';
    letters.visible = 1;
    letters.visibleIndex = 4;
    letters.props = {
      recommLetterList: []
    }

    const news = new DynamicComponentInfo();
    news.id = 0;
    news.code = BlockType.NEWS
    news.head = 'Новости';
    news.headCentered = true;
    news.dispalyName = 'Новости';
    news.name = 'ArticleList';
    news.visible = 1;
    news.visibleIndex = 7;
    news.props = {
      articleList: [],
      mode: 'columns'
    }

    const bayService = new DynamicComponentInfo();
    bayService.id = 0;
    bayService.code = BlockType.BUY_FORM;
    bayService.name = 'MessageForm';
    bayService.dispalyName = 'Заказать услугу'
    bayService.visible = 1;
    bayService.visibleIndex = 2;
    bayService.props = {
      title: 'Заказать услугу'
    }


    const askExpert = new DynamicComponentInfo();
    askExpert.id = 0;
    askExpert.code = BlockType.ASKEXPERT_FORM;
    askExpert.name = 'MessageForm';
    askExpert.dispalyName = 'Задать вопрос эксперту'
    askExpert.visible = 1;
    askExpert.visibleIndex = 8;
    askExpert.props = {
      title: 'Задать вопрос эксперту'
    }

    const clientTypeOfferList = new DynamicComponentInfo();
    clientTypeOfferList.id = 0;
    clientTypeOfferList.code = BlockType.CLIENTTYPE_OFFER;
    clientTypeOfferList.head = 'Комплексные решения';
    clientTypeOfferList.headCentered = true;
    clientTypeOfferList.name = 'ClientTypeOfferList';
    clientTypeOfferList.dispalyName = 'Комплексные решения'
    clientTypeOfferList.visible = 1;
    clientTypeOfferList.visibleIndex = 5;

    const businessTypeOfferList = new DynamicComponentInfo();
    businessTypeOfferList.id = 0;
    businessTypeOfferList.code = BlockType.BUSINESSTYPE_OFFER;
    businessTypeOfferList.head = 'Индивидуальные предложения';
    businessTypeOfferList.headCentered = true;
    businessTypeOfferList.name = 'BusinessTypeOfferList';
    businessTypeOfferList.dispalyName = 'Индивидуальные предложения'
    businessTypeOfferList.visible = 1;
    businessTypeOfferList.visibleIndex = 6;
    businessTypeOfferList.props = {
      offerList: []
    }

    const serviceList = new DynamicComponentInfo();
    serviceList.id = 0;
    serviceList.code = BlockType.SERVICE_LIST;
    serviceList.head = 'Список услуг';
    serviceList.headCentered = true;
    serviceList.name = 'ServiceList';
    serviceList.dispalyName = 'Список услуг'
    serviceList.visible = 1;
    serviceList.visibleIndex = 0;
    serviceList.props = {
      serviceList: []
    }

    const servicePriceTable = new DynamicComponentInfo();
    servicePriceTable.id = 0;
    servicePriceTable.code = BlockType.SERVICE_PRICE;
    servicePriceTable.head = 'Стоимость услуг';
    servicePriceTable.headCentered = true;
    servicePriceTable.name = 'ServicePriceTable';
    servicePriceTable.dispalyName = 'Стоимость услуг'
    servicePriceTable.visible = 1;
    servicePriceTable.visibleIndex = 1;
    servicePriceTable.props = {
      servicePriceList: [],
      allPricesPage: false
    }

    result.push(news, brandList, letters, bayService, askExpert, clientTypeOfferList, businessTypeOfferList, serviceList, servicePriceTable);

    return result;
  }

  private getDynamicComponentInfoFromDataBase (dvViewResult: any) {
    const result: DynamicComponentInfo[] = this.adminGetDynamicComponentsInfoDefault();

    dvViewResult.forEach((iterData) => {
      if (iterData.clSiteBlockCode === BlockType.FREE_CONTENT) {
        const freeBlockInfo = this.getFreeContentBlockDynamicComponentInfo(iterData);
        result.push(freeBlockInfo);
      } else {
        const iterCompoentnInfo = this.getDynamicComponentInfoByCode(result, iterData.clSiteBlockCode);
        if (!!iterCompoentnInfo) {
          iterCompoentnInfo.id = iterData.siteBlockId
          iterCompoentnInfo.visible = iterData.siteBlockVisibleInd
          iterCompoentnInfo.visibleIndex = iterData.siteBlockPosition
          iterCompoentnInfo.dispalyName = iterData.clSiteBlockName
        }
      }
    });

    return result;
  }

  private getDynamicComponentInfoByCode (infos: DynamicComponentInfo[], code: number): DynamicComponentInfo {
    return infos.find((iter) => iter.code === code);
  }

  private getFreeContentBlockDynamicComponentInfo (iterData: any): DynamicComponentInfo {
    const freeContentBlock = new DynamicComponentInfo();
    freeContentBlock.id = iterData.siteBlockId;
    freeContentBlock.code = 6;
    freeContentBlock.name = 'FreeContentBlock';
    freeContentBlock.head = iterData.siteBlockHeader;
    freeContentBlock.dispalyName = !!iterData.siteBlockName ? iterData.siteBlockName : 'Конструктор'
    freeContentBlock.visible = iterData.siteBlockVisibleInd;
    freeContentBlock.visibleIndex = iterData.siteBlockPosition;
    freeContentBlock.props = {
      //  bottomPosition: true,
      leftBlock: iterData.siteBlockContent,
      rightBlock: iterData.siteBlockContentRight
    }

    return freeContentBlock;
  }

  private async execAddBlockUnfoDbFunction (funcName: string, firstId: number, blockInfo: DynamicComponentInfo) {
    const standartArgs = [
      blockInfo.code,
      !!blockInfo.visible ? blockInfo.visible : 0,
      !!blockInfo.visibleIndex ? blockInfo.visibleIndex : 0,
      !!blockInfo.dispalyName ? blockInfo.dispalyName : '',
      !!blockInfo.head ? blockInfo.head : '',
      !!blockInfo.props && !!blockInfo.props.leftBlock ? blockInfo.props.leftBlock : '',
      !!blockInfo.props && !!blockInfo.props.rightBlock ? blockInfo.props.rightBlock : '',
      blockInfo.id
    ]
    const funcArgc = [firstId, ...standartArgs];
    return this.execFunction(funcName, funcArgc);
  }
}

enum BlockType {
  UFO = 0,
  BRANDS = 1,
  LETTERS = 2,
  NEWS = 3,
  BUY_FORM = 4,
  ASKEXPERT_FORM = 5,
  FREE_CONTENT = 6,
  CLIENTTYPE_OFFER = 7,
  BUSINESSTYPE_OFFER = 8,
  SERVICE_LIST = 9,
  SERVICE_PRICE = 10
}
