import { ISmsMessage } from './ISmsMessage';
import { SmsResponse } from './SmsResponse';

export abstract class SmsTransport {

  public abstract async send (message: ISmsMessage): Promise<SmsResponse>;

}

