/**
 * @module clientErrors
 */
/** */
import { Exception } from '../Exception';

export class BadRequest extends Exception {

  public name: string = 'BAD_REQUEST';

  constructor (message: string) {
    super(400, message);
  }
}
