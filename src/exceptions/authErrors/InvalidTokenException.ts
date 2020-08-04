import { SecurityException } from './SecurityException';


export class InvalidTokenException extends SecurityException {

  public name = 'INVALID_TOKEN';

  constructor({ message, innerException }: { message: string; innerException?: any; }) {
    super(message, innerException);
  }
}
