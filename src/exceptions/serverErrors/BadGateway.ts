/**
 * @module serverErrors
 */
/** */
import { Exception } from '../Exception';

export class BadGateway extends Exception {

  public name = 'BAD_GATEWAY';

  constructor (message: string) {
    super(502, message);
  }
}
