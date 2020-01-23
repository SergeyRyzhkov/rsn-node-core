/**
 * @module clientErrors
 */
/** */
import { Exception } from '../Exception';

export class RequestEntityTooLarge extends Exception {

  public name: string = 'REQUEST_ENTITY_TOO_LARGE';

  constructor (message: string) {
    super(413, message);
  }
}
