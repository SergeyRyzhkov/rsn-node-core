import { SecurityException } from './SecurityException';


export class InvalidTokenException extends SecurityException {

  public name: string = 'INVALID_TOKEN';

  constructor (message: string, innerException?: any) {
    super(message, innerException);
  }
}
