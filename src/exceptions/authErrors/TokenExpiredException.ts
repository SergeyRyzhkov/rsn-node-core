import { SecurityException } from './SecurityException';


export class TokenExpiredException extends SecurityException {
  public name: string = 'TOKEN_EXPIRED';

  constructor (message: string, innerException?: any) {
    super(message, innerException);
  }
}
