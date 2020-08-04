/**
 * @module clientErrors
 */
/** */
import { Exception } from '../Exception';

export class NotFound extends Exception {

  public name = 'NOT_FOUND';

  constructor (message: string) {
    super(404, message);
  }
}
