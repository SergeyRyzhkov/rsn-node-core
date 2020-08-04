/**
 * @module clientErrors
 */
/** */
import { Exception } from '../Exception';

export class RequestTimeout extends Exception {

  public name = 'REQUEST_TIMEOUT';

  constructor (message: string) {
    super(408, message);
  }
}
