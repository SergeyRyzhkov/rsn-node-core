import { SmsMessage } from './SmsMessage';
import { SmsTransport } from './SmsTransport';
import { SmsResponse } from './SmsResponse';
import { fetchWrapper } from '@/utils/FetchWrapper';

export class SmsRuTransport extends SmsTransport {

  private rootUrl = 'https://sms.ru/sms/';
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  // FIXME: Обрезать сообщение до 70 символов
  public async send (message: SmsMessage): Promise<SmsResponse> {
    let params = `to=${message.toPhone}&msg=${message.message}`;

    if (!!message.from) {
      params = `${params}&from=${message.from}`;
    }

    const response = await this.doRequest('send', params);
    const json = response.data;
    const result = new SmsResponse();

    result.balance = json.balance;
    result.status = json.status;
    result.statusCode = json.status_code;

    if (!!json && !!json.sms) {
      for (const iterSmsInfoKey of Object.keys(json.sms)) {
        const smsInfoObj = json.sms[iterSmsInfoKey];
        const smsInfo = {
          id: smsInfoObj.sms_id,
          status: smsInfoObj.status,
          statusCode: smsInfoObj.status_code,
          statusText: smsInfoObj.status_text
        }
        result.smsInfoList.push(smsInfo);
      }
    }
    return result;
  }

  private doRequest (command: string, params: string) {
    const url = `${this.rootUrl}${command}?api_id=${this.apiKey}&json=1&${params}`;
    return fetchWrapper.getJSON(url);
  }

}