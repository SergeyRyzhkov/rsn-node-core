import * as request from 'request-promise-native'
import PgUtls from '@/utils/PgUtils';
import * as fs from 'fs';
import ServiceContainer from './ServiceContainer';
import * as path from 'path';

export default class RgisService {
  private rgisFwsUrl = 'http://gs1.new.rgis.spb.ru/geoserver/wfs?service=wfs&version=2.0.0&OUTPUTFORMAT=application/json&REQUEST=GetFeature&TYPENAME=';

  public delay = async () => {
    return new Promise((resolve) => setTimeout(resolve, 2000));
  }

  public async start () {
    const filename = path.resolve('rgis_layers', 'rgis_layers.txt');
    const lines = fs.readFileSync(filename, 'utf-8')
      .split('\n')
      .filter(Boolean);

    const deleteStmt = 'DELETE FROM brc_geodata.layer_meta';
    await PgUtls.execNone(deleteStmt);

    lines.forEach(async (iterLine) => {
      const splitter = iterLine.split(';');
      const layerName = splitter[0];
      const layerDescription = splitter[1];

      await this.addToMeta(layerName, layerDescription);
    });

    const geoJson = await this.getLayerGeoJson('rgis:CO_ZONA_PROTECT_MODE')
    this.insertArticleZPM(geoJson);

    // for (const iterFeature of lines) {
    //   await this.delay();

    //   const splitter = iterFeature.split(';');
    //   const layerName = splitter[0];

    //   const geoJson = await this.getLayerGeoJson(layerName);
    //   const geoJsonFileName = layerName.replace(':', '_') + '.json';
    //   fs.writeFile(`rgis_layers/${geoJsonFileName}`, geoJson, (err) => { });

    // }
  }


  private async addToMeta (layerName: string, layerDescription: string) {
    const insertStmt = `INSERT INTO brc_geodata.layer_meta (layer_meta_layer_name,layer_meta_layer_description) values ($1,$2)`;
    await PgUtls.execNone(insertStmt, [layerName, layerDescription]);
  }

  private async insertArticleZPM (zonaProtectModeGeoJsonString: string) {
    const zonaProtectModeGeoJson = JSON.parse(zonaProtectModeGeoJsonString);
    const features = zonaProtectModeGeoJson.features;
    for (const iterFeature of features) {
      await this.delay();

      const code = iterFeature.properties.MODE_CODE;
      const data = await this.getRequestResult(`http://new.rgis.spb.ru/map_api/additional_info/ArticleZPM/${code}`, true);

      const insertStmt = `INSERT INTO brc_geodata.layer_text_data (layer_text_data_layer_name,layer_text_data_text, layer_text_layer_feature_id) values ('CO_ZONA_PROTECT_MOD',$1,'${code}')`;
      await PgUtls.execNone(insertStmt, data);
      // const fileName = 'ArticleZPM_' + code + '.html';
      // fs.writeFile(`rgis_layers/docs/${fileName}`, data, { encoding: 'utf8' }, (err) => { });
    }
  }

  private async getLayerGeoJson (layerName: string) {
    return this.getRequestResult(this.rgisFwsUrl + layerName);
  }

  private async getRequestResult (uri: string, isContentTypeHtml = false) {
    const config = {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        // 'Accept-Encoding': 'gzip,deflate',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        // 'Content-Type': isContentTypeHtml ? 'text/html; charset=UTF-8' : 'application/json; charset=UTF-8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': 1,
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0' + Math.random().toString()
        // 'Host': 'gs1.new.rgis.spb.ru'
      },
      // rejectUnauthorized: false,
      // strictSSL: false,
      resolveWithFullResponse: true,
      uri
    }
    try {
      const result = await request(config);
      if (result.statusCode === 200 || !result.statusCode) {
        return result.body;
      }
      return false;
    } catch (err) {
      return false;
    }
  }
}

