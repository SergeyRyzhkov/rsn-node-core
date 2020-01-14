import * as path from 'path';
import * as fs from 'fs';
import * as cuid from 'cuid';
import * as mime from 'mime-types';
import BaseService from '../BaseService';
import FormMessageData from '@/entities/FormMessageData';

export default class MediaService extends BaseService {

  public async saveSiteSectionImage (siteSectionId: number, file: Express.Multer.File, isBig: boolean) {
    const updateStmt = `UPDATE site_section SET site_section_img_${isBig ? 'big' : 'small'} = $1 where site_section_id = ${siteSectionId}`;
    return this.updateSmallOrBigImageFor(file, 'sitesection', `${isBig ? 'big' : 'small'}_${siteSectionId}`, updateStmt);
  }

  public async saveServiceImage (serviceId: number, file: Express.Multer.File, isBig: boolean) {
    const updateStmt = `UPDATE business_service SET business_service_img_${isBig ? 'big' : 'small'} = $1 where business_service_id = ${serviceId}`;
    return this.updateSmallOrBigImageFor(file, 'service', `${isBig ? 'big' : 'small'}_${serviceId}`, updateStmt);
  }

  public async saveOfferImage (offerId: number, file: Express.Multer.File, isBig: boolean) {
    const updateStmt = `UPDATE individual_offer SET ind_offer_img_${isBig ? 'big' : 'small'} = $1 where ind_offer_id = ${offerId}`;
    return this.updateSmallOrBigImageFor(file, 'offer', `${isBig ? 'big' : 'small'}_${offerId}`, updateStmt);
  }

  public async saveBrandImage (brandId: number, file: Express.Multer.File, isBig: boolean) {
    const updateStmt = `UPDATE cl_brand SET cl_brand_img_${isBig ? 'big' : 'small'} = $1 where cl_brand_id = ${brandId}`;
    return this.updateSmallOrBigImageFor(file, 'brands', `${isBig ? 'big' : 'small'}_${brandId}`, updateStmt);
  }

  public async saveNewsImage (newsId: number, file: Express.Multer.File, isBig: boolean) {
    const updateStmt = `UPDATE article SET article_${isBig ? 'header_img_src' : 'preview_img_src'} = $1 where article_id = ${newsId}`;
    return this.updateSmallOrBigImageFor(file, 'news', `${isBig ? 'big' : 'small'}_${newsId}`, updateStmt);
  }

  public async saveRecommendationLetterImage (recommendationId: number, file: Express.Multer.File) {
    const updateStmt = `UPDATE recommendation SET recomm_brand_img = $1 where recomm_id = ${recommendationId}`;
    return this.updateSmallOrBigImageFor(file, 'letters', `letter_${recommendationId}`, updateStmt);
  }

  public async saveSitePageImage (sitePageId: number, file: Express.Multer.File) {
    const updateStmt = `UPDATE site_page SET site_page_banner = $1 where site_page_id = ${sitePageId}`;
    return this.updateSmallOrBigImageFor(file, 'main', `page_${sitePageId}`, updateStmt);
  }

  public async saveUserMessage (formMessageData: FormMessageData, file: Express.Multer.File) {
    return await this.saveFileFromRequestBody(file, 'user', 'user');
    // return сохраняем сами данные формы
  }

  public getImageFullPathAndFileName (subDir: string, fileprefix: string, fileExt: string) {
    const pathName = path.resolve('static', 'img', subDir);
    const fileName = `${fileprefix}_${cuid()}.${fileExt}`;
    if (!fs.existsSync(pathName)) {
      fs.mkdirSync(pathName);
    }

    return [path.resolve(pathName, fileName), fileName];
  }

  public async saveFileFromRequestBody (file: Express.Multer.File, subDir: string, fileprefix: string) {
    if (!!file && file.size > 0) {
      let fileExt = mime.extension(file.mimetype);
      fileExt = fileExt ? fileExt : 'txt';

      const pathAndName = this.getImageFullPathAndFileName(subDir, fileprefix, fileExt);

      const promise = new Promise((resolve, reject) => {
        if (pathAndName[0]) {
          fs.writeFile(pathAndName[0], file.buffer, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(pathAndName);
            }
          })
        } else {
          resolve(pathAndName);
        }
      }
      )
      return promise;
    } else {
      Promise.resolve(false);
    }
  }

  private async updateSmallOrBigImageFor (file: Express.Multer.File, imageStaticSubFolderName: string, filePrefix: string, updateStmt: string) {
    const pathAndName = await this.saveFileFromRequestBody(file, imageStaticSubFolderName, filePrefix);
    if (pathAndName) {
      return this.execNone(updateStmt, [`/img/${imageStaticSubFolderName}/${pathAndName[1]}`]);
    }
  }
}
