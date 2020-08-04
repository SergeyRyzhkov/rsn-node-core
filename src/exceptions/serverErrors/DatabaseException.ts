/**
 * @module serverErrors
 */
/** */
import { Exception } from '../Exception';
import { InternalServerError } from './InternalServerError';

export class DatabaseException extends InternalServerError {

  public name = 'DATABASE_ERROR';

  constructor (message: string, innerException?: any) {
    super(message, innerException);
  }
}
