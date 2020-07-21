import { SmsTransport } from './SmsTransport';
import { ISmsMessage } from './ISmsMessage';
import { SmsResponse } from './SmsResponse';

export class SmsSender {

  private transport: SmsTransport;

  constructor (transport: SmsTransport) {
    this.transport = transport;
  }

  public async send (message: ISmsMessage, callback: (result: SmsResponse) => void): Promise<SmsResponse> {
    let result: SmsResponse;
    if (!!this.transport) {
      message.message = encodeURIComponent(message.message);
      result = await this.transport.send(message);
      if (!!callback) {
        callback(result);
      }
    }
    return result;
  }

}

