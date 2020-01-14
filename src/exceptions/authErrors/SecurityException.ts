import { Exception } from '../Exception';


export class SecurityException extends Exception {

  public name: string = 'SECURITY_EXCEPTION';

  constructor (message: string, innerException?: any) {
    super(401, message, innerException);
  }
}
