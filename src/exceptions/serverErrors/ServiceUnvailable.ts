/**
 * @module serverErrors
 */
/** */
import { Exception } from '../Exception';

export class ServiceUnvailable extends Exception {

  public name: string = 'SERVICE_UNVAILABLE';

  constructor (message: string, innerException?: any) {
    super(503, message, innerException);
  }
}
