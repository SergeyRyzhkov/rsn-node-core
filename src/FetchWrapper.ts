import { Response } from 'node-fetch';
import fetch from 'node-fetch';
import * as HttpProxyAgent from 'http-proxy-agent';
import * as HttpsProxyAgent from 'https-proxy-agent';

// TODO: Сделать отдельно ля json, body,text, blob, formData? Или в результат прописывать  fetchResult?
// TODO: Скачивание файла и запись в файл 
// TODO: Patch отдельно сденлать

// Интросептеры как ниже или свой пул use (req,resp).use... использовать
// fetch = (originalFetch => {
//   return (...arguments) => {
//     const result = originalFetch.apply(this, arguments)
//     return result.then(console.log("Request was sent"))
//   }
// })(fetch)

class FetchWrapper {

  public async get (url: string, options?: any, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {
    const res = this.doFetch(url, { ...options, ...{ method: 'GET' } }, proxy);
    return this.processRequest(res);
  }

  public async put (url: string, options?: any, body?: any, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {
    return this.putOrPost(false, url, options, body, proxy);
  }

  public async post (url: string, options?: any, body?: any, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {
    return this.putOrPost(true, url, options, body, proxy);
  }

  public async postForm (url: string, formData: FormData, options?: any, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {
    const conf = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }

    return this.post(url, formData, { ...options, ...conf }, proxy);
  }

  public async delete (url: string, options?: any, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {
    const res = this.doFetch(url, { ...options, ...{ method: 'DELETE' } }, proxy);
    return this.processRequest(res);
  }

  private putOrPost (isPost: boolean, url: string, options?: any, body?: any, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {
    const mergedOptions = { ...options, ...{ method: isPost ? 'POST' : 'PUT' }, ... { body: !!body ? (String(body) === body ? body : JSON.stringify(body)) : null } };
    const res = this.doFetch(url, mergedOptions, proxy);
    return this.processRequest(res);
  }

  private async processRequest (fetchResult: Promise<Response>): Promise<{ data: any, status: number, statusText: string }> {
    const response: any = {}
    try {
      const result = await fetchResult;

      response.data = await result.json();
      response.status = result.status;
      response.statusText = result.statusText;

      if (!result.ok || result.status > 399) {
        return Promise.reject(response);
      }
      return Promise.resolve(response);
    }
    catch (err) {
      response.statusText = err.message;
      return Promise.reject(response);
    }
  }

  private doFetch (url: string, options?: any, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }): Promise<Response> {
    const defaultOptions: any = {
      timeout: 5000,
      headers: {
        'Accept': 'text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0' + Math.random().toString()
      },
      follow: 9
    }

    const requestOptions = { ...defaultOptions, ...options };

    if (!!proxy) {
      const proxyProtocol = proxy.proxyProtocol || 'http';
      const proxyUri = `${proxyProtocol}://${proxy.proxyIpAddress}:${proxy.proxyPort}`;
      const agent = url.toLowerCase().startsWith('https') ? new HttpsProxyAgent.HttpsProxyAgent(proxyUri) : new HttpProxyAgent.HttpProxyAgent(proxyUri);
      requestOptions.agent = agent;
      requestOptions.agent.timeout = requestOptions.timeout;
    }

    return fetch(url, requestOptions);
  }

}

export const fetchWrapper = new FetchWrapper();

