import BaseService from '../BaseService';
import TypeOrmManager from '@/utils/TypeOrmManager';
import { BusinessService } from '@/entities/ekoset/BusinessService';
import * as slugify from '@sindresorhus/slugify';

export default class BusinessServiceService extends BaseService {
  private businessClientTypeId = 1;
  private PrivatePersonClientTypeId = 3;

  private apiViewName = 'v_api_business_service';
  private apiAdminViewName = 'v_api_admin_business_service'
  private apiClientServiceViewName = 'v_api_client_business_service';
  private apiActivityServiceViewName = 'v_api_activity_business_service';
  private apiChildServiceViewName = 'v_api_second_level_business_service';


  public async getAll () {
    return this.getDbViewResult(this.apiAdminViewName);
  }

  public async getMainList () {
    return this.getDbViewResult(this.apiViewName, null, 'business_service_parent_id IS NULL and business_service_status=1');
  }

  public async getAllBySiteSectionId (siteSectionId: number, excludeChild: boolean) {
    const selectStmt = excludeChild ? 'business_service_status=1 and site_section_id = $1 and business_service_parent_id IS NULL' : 'business_service_status=1 and site_section_id = $1'
    return this.getDbViewResult(this.apiViewName, null, selectStmt, [siteSectionId]);
  }

  // По виду объекта
  public async getByActivityAndBySiteSectionId (siteSectionId: number, activityId: number, excludeChild: boolean) {
    const selectStmt = excludeChild ? 'business_service_status=1 and site_section_id = $1 and cl_activity_id = $2 and business_service_parent_id IS NULL' : 'business_service_status=1 and site_section_id = $1 and cl_activity_id = $2'
    return this.getDbViewResult(this.apiActivityServiceViewName, null, selectStmt, [siteSectionId, activityId]);
  }

  // Услуги для Бизнеса
  public async getForBusinessBySiteSectionId (siteSectionId: number, excludeChild: boolean) {
    const selectStmt = excludeChild ? 'business_service_status=1 and site_section_id = $1 and cl_client_id = $2 and business_service_parent_id IS NULL' : 'business_service_status=1 and site_section_id = $1 and cl_client_id = $2'
    return this.getDbViewResult(this.apiClientServiceViewName, null, selectStmt, [siteSectionId, this.businessClientTypeId]);
  }

  // Услуги для частных лиц
  public async getForPrivatePersonBySiteSectionId (siteSectionId: number, excludeChild: boolean) {
    const selectStmt = excludeChild ? 'business_service_status=1 and site_section_id = $1 and cl_client_id = $2 and business_service_parent_id IS NULL' : 'business_service_status=1 and site_section_id = $1 and cl_client_id = $2'
    return this.getDbViewResult(this.apiClientServiceViewName, null, selectStmt, [siteSectionId, this.PrivatePersonClientTypeId]);
  }

  // Получить услуги второго уровня
  public async getChildServicesByParentId (parentId: number) {
    return this.getDbViewResult(this.apiChildServiceViewName, null, 'business_service_status=1 and business_service_parent_id = $1', [parentId]);
  }

  // Получить услуги второго уровня
  public async adminGetChildServicesByParentId (parentId: number) {
    return this.getDbViewResult(this.apiChildServiceViewName, null, 'business_service_parent_id = $1', [parentId]);
  }

  public async getById (id: number) {
    return this.getOneById(this.apiViewName, 'business_service_id = $1', id);
  }

  public async save (businessService: BusinessService) {
    businessService.businessServiceSlug = slugify(businessService.businessServiceName)
    return TypeOrmManager.EntityManager.save(businessService);
  }

  public async delete (id: number) {
    return this.deleteById('business_service', 'business_service_id = $1', id);
  }


  // Не учитывая статус
  public async adminGetAllBySiteSectionId (siteSectionId: number) {
    const selectStmt = 'site_section_id = $1 and business_service_parent_id IS NULL';
    return this.getDbViewResult(this.apiViewName, null, selectStmt, [siteSectionId]);
  }

  // Тип клиента и тип направления деятельности для услуги
  public async getAdminСlActivitiesForService (businessServiceId: number) {
    return this.execFunction('f_admin_cl_activities_service', [businessServiceId]);
  }

  public async getAdminclClientsForService (businessServiceId: number) {
    return this.execFunction('f_admin_cl_client_service', [businessServiceId]);
  }

  public async setPrivatePerson2Service (businessServiceId: number) {
    return this.execFunction('f_admin_add_clienttype2service', [3, businessServiceId]);
  }

  public async setBusinessType2Service (businessServiceId: number) {
    return this.execFunction('f_admin_add_clienttype2service', [1, businessServiceId]);
  }

  public async setActivityType2Service (businessServiceId: number, activityTypeId: number) {
    return this.execFunction('f_admin_add_activitytype2service', [businessServiceId, activityTypeId]);
  }

  public async removePrivatePersonFromService (businessServiceId: number) {
    return this.execFunction('f_admin_remove_clienttype_from_service', [3, businessServiceId]);
  }

  public async removeBusinessTypeFromService (businessServiceId: number) {
    return this.execFunction('f_admin_remove_clienttype_from_service', [1, businessServiceId]);
  }

  public async removeActivityTypeFromService (businessServiceId: number, activityTypeId: number) {
    return this.execFunction('f_admin_remove_activitytypefromservice', [businessServiceId, activityTypeId]);
  }


  public async adminGetFooterServicesRelation (isBusinessClientType: boolean) {
    const selectStmt = `cl_client_id = ${isBusinessClientType ? this.businessClientTypeId : this.PrivatePersonClientTypeId}`;
    return this.getDbViewResult('v_api_client_business_service_relation', null, selectStmt);
  }


  public async adminGetFooterServicesForPrivateClient () {
    const selectStmt = 'cl_client_id = $1 and footer_include_ind=1';
    return this.getDbViewResult(this.apiClientServiceViewName, null, selectStmt, [this.PrivatePersonClientTypeId]);
  }

  public async adminGetFooterServicesForBusinessClient () {
    const selectStmt = 'cl_client_id = $1 and footer_include_ind=1';
    return this.getDbViewResult(this.apiClientServiceViewName, null, selectStmt, [this.businessClientTypeId]);
  }

  public async getFooterServicesForPrivateClient () {
    const selectStmt = 'cl_client_id = $1 and footer_include_ind=1 and business_service_status=1';
    return this.getDbViewResult(this.apiClientServiceViewName, null, selectStmt, [this.PrivatePersonClientTypeId]);
  }

  public async getFooterServicesForBusinessClient () {
    const selectStmt = 'cl_client_id = $1 and footer_include_ind=1 and business_service_status=1';
    return this.getDbViewResult(this.apiClientServiceViewName, null, selectStmt, [this.businessClientTypeId]);
  }


  public async adminAddFooterServicesForPrivateClient (businessServiceId: number) {
    const updateStmt = `UPDATE business_service_cl_client SET footer_include_ind = 1 where business_service_id = $1 and cl_client_id = $2`;
    return this.execNone(updateStmt, [businessServiceId, this.PrivatePersonClientTypeId]);
  }

  public async adminAddFooterServicesForBusinessClient (businessServiceId: number) {
    const updateStmt = `UPDATE business_service_cl_client SET footer_include_ind = 1 where business_service_id = $1 and cl_client_id = $2`;
    return this.execNone(updateStmt, [businessServiceId, this.businessClientTypeId]);
  }

  public async adminRemoveFooterForPrivateClient (businessServiceId: number) {
    const updateStmt = `UPDATE business_service_cl_client SET footer_include_ind = 0 where business_service_id = $1 and cl_client_id = $2`;
    return this.execNone(updateStmt, [businessServiceId, this.PrivatePersonClientTypeId]);
  }

  public async adminRemoveFooterForBusinessClient (businessServiceId: number) {
    const updateStmt = `UPDATE business_service_cl_client SET footer_include_ind = 0 where business_service_id = $1 and cl_client_id = $2`;
    return this.execNone(updateStmt, [businessServiceId, this.businessClientTypeId]);
  }
}
