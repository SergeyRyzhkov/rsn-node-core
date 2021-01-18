import { SmsMessage } from './SmsMessage';
import { SmsResponse } from './SmsResponse';

export abstract class SmsTransport {

  public abstract  send (message: SmsMessage): Promise<SmsResponse>;

}

