/**
 * @module serverErrors
 */
/** */
import { Exception } from '../Exception';

export class NotImplemented extends Exception {

  public name: string = 'NOT_IMPLEMENTED';

  constructor (message: string) {
    super(501, message);
  }
}
