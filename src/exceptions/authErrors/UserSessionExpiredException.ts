import { SecurityException } from './SecurityException';


export class UserSessionExpiredException extends SecurityException {

  public name: string = 'SESSION_EXPIRED';

  constructor (message: string, innerException?: any) {
    super(message, innerException);
  }
}
