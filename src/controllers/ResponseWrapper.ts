import { Exception } from '@/exceptions/Exception';
import ClientNotifyMessage from './ClientNotifyMessage';

export class ResponseWrapper {

  public static createSuccsess (data: {}, status = 200, message?: ClientNotifyMessage, redirectUrl?: string): ResponseWrapper {
    const responseData = new ResponseWrapper(true, data, 'OK', status, redirectUrl);
    if (message) {
      responseData.showNotify = message;
    }
    return responseData;
  }

  public static createFailure (exc: Exception, message?: ClientNotifyMessage, redirectUrl?: string): ResponseWrapper {
    const responseData = new ResponseWrapper(false, exc, exc.message, !!(exc.status) ? exc.status : 500, redirectUrl);
    if (message) {
      responseData.showNotify = message;
    }
    return responseData;
  }

  public success: boolean;
  public data: {};
  public message: string;
  public status: number;
  public redirectUrl: string | null
  public showNotify: ClientNotifyMessage

  constructor (success: boolean, data = {}, message = '', status: number, redirectUrl: string | null) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.status = status;
    this.redirectUrl = redirectUrl;
  }


}
