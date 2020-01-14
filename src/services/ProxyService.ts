import * as request from 'request-promise-native'
import PgUtls from '@/utils/PgUtils';
import * as fs from 'fs';
import ServiceContainer from './ServiceContainer';
import * as path from 'path';
import BaseService from './BaseService';
import * as ProxyLists from 'proxy-lists'
import { logger } from '@/utils/Logger';
import { ProxyItem } from '@/entities/proxy/ProxyItem';
import TypeOrmManager from '@/utils/TypeOrmManager';
import { promises } from 'dns';

export default class ProxyService extends BaseService {

  public updateProxies () {
    let result: any = null;
    ProxyLists.getProxies({
      protocols: ['http', 'https', 'socks5', 'socks4']
    })
      .on('data', (proxies) => {
        result = proxies;
        this.saveOrUpdateProxyList(result);
      });

    return result;
  }

  public async getProxies () {
    return this.getDbViewResult('proxy_list');
  }

  public startCheckProxies () {

  }

  public async sendRequest (requestInfo: any) {
    const allProxies = await this.getDbViewResult('proxy_list');

    allProxies.forEach(async (iterItem) => {
      const iterProxy = 'http://' + iterItem.proxyListIpAddress + ':' + iterItem.proxyListPort;
      // await this.getRequestResult(requestInfo.url, iterProxy);
    });

    await this.getRequestResult(requestInfo.url, '');

    return {};
  }

  private async saveOrUpdateProxyList (proxyList: any) {
    const promises = [];
    proxyList.forEach((iterItem) => {
      promises.push(this.saveOrUpdateProxy(iterItem));
    });
    await Promise.all(promises);
  }

  private async saveOrUpdateProxy (proxy: any) {
    const item: ProxyItem = new ProxyItem();

    const tryFind = await this.getOneById('proxy_list', 'proxy_list_ip_address = $1', proxy.ipAddress);
    if (!tryFind) {
      item.proxyListAnonymitylevel = proxy.anonymityLevel;
      item.proxyListCountry = proxy.country;
      item.proxyListIpAddress = proxy.ipAddress;
      item.proxyListPort = proxy.port;
      item.proxyListProtocol = proxy.protocols;
      item.proxyListSource = proxy.source;
      await TypeOrmManager.EntityManager.save(item);
    }
  }


  private async getRequestResult (uri: string, proxyItem: string): Promise<string> {
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
      strictSSL: false,
      resolveWithFullResponse: true,
      uri,
      proxy: 'http://23.96.4.159:8080',
      //   proxy: proxyItem,
      timeout: 5000,
    }
    try {
      const proxiedResult = await request(config);
      //   const proxedRp = rp.OptionsWithUri =
      // const result = await proxedRp(config);

      // const proxiedRequest = request.defaults({ proxy: 'http://23.96.4.159:8080' });
      // const result = await proxiedRequest.get(uri);

      if (proxiedResult.statusCode === 200 || !proxiedResult.statusCode) {
        return proxiedResult.body;
      }
      return '';
    } catch (err) {
      return '';
    }
  }
}
