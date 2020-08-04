/**
 * @module clientErrors
 */
/** */
import { Exception } from '../Exception';

export class RequestHeaderFieldsTooLarge extends Exception {

  public name = 'REQUEST_HEADER_FIELDS_TOO_LARGE';

  constructor (message: string) {
    super(431, message);
  }
}
