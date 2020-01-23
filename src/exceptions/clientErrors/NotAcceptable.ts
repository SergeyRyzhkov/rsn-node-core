/**
 * @module clientErrors
 */
/** */
import { Exception } from '../Exception';

export class NotAcceptable extends Exception {

  public name: string = 'NOT_ACCEPTABLE';

  constructor (message: string) {
    super(406, 'You must accept content-type ' + message);
  }
}
