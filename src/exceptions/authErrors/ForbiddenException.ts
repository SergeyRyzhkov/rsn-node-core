import { SecurityException } from './SecurityException';


export class ForbiddenException extends SecurityException {

  public name = 'FORBIDDEN_EXCEPTION';

  constructor(message?: string, innerException?: any) {
    super(message, innerException);
    this.status = 403;
  }
}
