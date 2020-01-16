import * as path from 'path';
import * as fs from 'fs';
import * as cuid from 'cuid';
import * as mime from 'mime-types';
import BaseService from './BaseService';

export default class MediaService extends BaseService {


  public async saveSitePageImage (sitePageId: number, file: Express.Multer.File) {
    const updateStmt = `UPDATE site_page SET site_page_banner = $1 where site_page_id = ${sitePageId}`;
    return this.updateSmallOrBigImageFor(file, 'main', `page_${sitePageId}`, updateStmt);
  }

  public createImageFullPathAndFileName (subDir: string, fileprefix: string, fileExt: string) {
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

      const pathAndName = this.createImageFullPathAndFileName(subDir, fileprefix, fileExt);

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
