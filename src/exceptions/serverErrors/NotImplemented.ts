/**
 * @module serverErrors
 */
/** */
import { Exception } from '../Exception';

export class NotImplemented extends Exception {

  public name = 'NOT_IMPLEMENTED';

  constructor (message: string) {
    super(501, message);
  }
}
