import fetch from 'node-fetch';
import * as HttpProxyAgent from 'http-proxy-agent';
import * as HttpsProxyAgent from 'https-proxy-agent';

export const requestPromise = async (url: string, options?: any, proxy?: { proxyProtocol: string, proxyListIpAddress: string, proxyListPort: number }): Promise<any> => {
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
    const proxyUri = `${proxyProtocol}://${proxy.proxyListIpAddress}:${proxy.proxyListPort}`;
    const agent = url.toLowerCase().startsWith('https') ? new HttpsProxyAgent.HttpsProxyAgent(proxyUri) : new HttpProxyAgent.HttpProxyAgent(proxyUri);
    requestOptions.agent = agent;
    requestOptions.agent.timeout = requestOptions.timeout;
  }

  return fetch(url, requestOptions);
}