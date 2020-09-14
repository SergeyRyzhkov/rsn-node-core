import { Response } from 'node-fetch';
import fetch from 'node-fetch';
import HttpProxyAgent from 'http-proxy-agent';
import HttpsProxyAgent from 'https-proxy-agent';
import fs from 'fs';
import { createReadStream } from 'fs';
import util from 'util';
import stream from "stream";

const streamPipeline = util.promisify(stream.pipeline)

class FetchWrapper {

  public async getJSON (url: string, options?: any, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {
    return this.get(url, options, proxy);
  }

  public async getText (url: string, options?: any, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {
    return this.get(url, options, proxy, (resp) => resp.text());
  }

  public async getTextConverted (url: string, options?: any, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {
    return this.get(url, options, proxy, (resp) => resp.textConverted());
  }

  public async getBuffer (url: string, options?: any, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {
    return this.get(url, options, proxy, (resp) => resp.buffer());
  }

  public async getArrayBuffer (url: string, options?: any, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {
    return this.get(url, options, proxy, (resp) => resp.arrayBuffer());
  }

  public async getBlob (url: string, options?: any, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {
    return this.get(url, options, proxy, (resp) => resp.blob());
  }

  public async download (url: string, filePath: string, options?: any, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {
    try {
      const result = await this.get(url, options, proxy);
      await streamPipeline(result.body, fs.createWriteStream(filePath));
      Promise.resolve(result);
    }
    catch (err) {
      Promise.reject({ statusText: err.message });
    }
  }

  public async uploadFile (url: string, filePath: string, method: 'POST' | 'PUT' | 'PATCH', options?: any) {
    return this.putOrPostOrPatch(url, method, options, createReadStream(filePath));
  }

  public async put (url: string, options?: any, body?: ArrayBuffer | ArrayBufferView | NodeJS.ReadableStream | string | URLSearchParams | FormData, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {
    return this.putOrPostOrPatch('PUT', url, options, body, proxy);
  }

  public async post (url: string, options?: any, body?: ArrayBuffer | ArrayBufferView | NodeJS.ReadableStream | string | URLSearchParams | FormData, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {
    return this.putOrPostOrPatch('POST', url, options, body, proxy);
  }

  public async patch (url: string, options?: any, body?: ArrayBuffer | ArrayBufferView | NodeJS.ReadableStream | string | URLSearchParams | FormData, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {
    return this.putOrPostOrPatch('PATCH', url, options, body, proxy);
  }

  public async postForm (url: string, formData: FormData, options?: any, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {
    const conf = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
    return this.putOrPostOrPatch('POST', url, { ...options, ...conf }, formData, proxy);
  }

  public async delete (url: string, options?: any, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {
    const res = this.doFetch(url, { ...options, ...{ method: 'DELETE' } }, proxy);
    return this.processRequest(res);
  }

  private async get (url: string, options?: any, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }, getDataFn?: (response: Response) => any) {
    const res = this.doFetch(url, { ...options, ...{ method: 'GET' } }, proxy);
    return this.processRequest(res, getDataFn);
  }

  private putOrPostOrPatch (method: string, url: string, options?: any,
    body?: ArrayBuffer | ArrayBufferView | NodeJS.ReadableStream | string | URLSearchParams | FormData,
    proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }) {

    const mergedOptions = { ...options, ...{ method }, ... { body } };
    const res = this.doFetch(url, mergedOptions, proxy);
    return this.processRequest(res);
  }


  private doFetch (url: string, options?: any, proxy?: { proxyProtocol: string, proxyIpAddress: string, proxyPort: number }): Promise<Response> {
    const defaultOptions: any = {
      timeout: 5000,
      // headers: {
      //   'Accept': 'text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      //   'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0' + Math.random().toString()
      // },
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


  private async processRequest (fetchResult: Promise<Response>, getDataFn?: (response: Response) => any): Promise<{ data: any, status: number, statusText: string, headers: Headers, body: NodeJS.ReadableStream }> {
    const response: any = {}
    try {
      const result = await fetchResult;

      response.data = !!getDataFn ? await getDataFn(result) : await result.json();
      response.status = result.status;
      response.statusText = result.statusText;
      response.headers = result.headers;
      response.body = result.body

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
}

export const fetchWrapper = new FetchWrapper();

