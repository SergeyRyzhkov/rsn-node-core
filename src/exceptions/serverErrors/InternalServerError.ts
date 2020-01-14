/**
 * @module serverErrors
 */
/** */
import { Exception } from '../Exception';

export class InternalServerError extends Exception {

  public name: string = 'INTERNAL_SERVER_ERROR';

  constructor (message: string, innerException?: any) {
    super(500, message, innerException);
  }
}
