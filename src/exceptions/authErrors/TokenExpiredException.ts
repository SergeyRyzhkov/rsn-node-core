import { SecurityException } from './SecurityException';


export class TokenExpiredException extends SecurityException {
  public name = 'TOKEN_EXPIRED';

  constructor (message: string, innerException?: any) {
    super(message, innerException);
  }
}
