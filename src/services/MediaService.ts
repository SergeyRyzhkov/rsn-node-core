import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import { BaseService } from './BaseService';

export class MediaService extends BaseService {

  public getExtension (file: Express.Multer.File) {
    return mime.extension(file.mimetype);
  }

  public async saveFileFromRequestBody (file: Express.Multer.File, fileName: string, ...pathSegments: string[]) {
    if (!!file && file.size > 0) {
      let fileExt = mime.extension(file.mimetype);
      fileExt = fileExt ? fileExt : 'txt';

      const folder = path.resolve('static', ...pathSegments);
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }
      const filePath = path.resolve(folder, !!fileName ? fileName : file.originalname)

      const promise = new Promise((resolve, reject) => {
        if (fileName) {
          fs.writeFile(filePath, file.buffer, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(filePath);
            }
          })
        } else {
          resolve(filePath);
        }
      }
      )
      return promise;
    } else {
      Promise.resolve(false);
    }
  }
}
