import * as fs from 'fs';

export  class Base64 {

  public static async encode (filePath: string) {
    const promise = new Promise((resolve, reject) => {
      fs.exists(filePath, (exists) => {
        if (exists) {
          fs.readFile(filePath, { encoding: 'base64' }, (err, data: string) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          })
        }
      })
    });
    return promise;
  }

  public static async decode (encoded: string, filePath?: string) {
    const promise = new Promise((resolve, reject) => {
      const decoded = Buffer.from(encoded, 'base64');
      if (filePath) {
        fs.writeFile(filePath, decoded, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        })
      } else {
        resolve(decoded);
      }
    }
    )
    return promise;
  }
}
