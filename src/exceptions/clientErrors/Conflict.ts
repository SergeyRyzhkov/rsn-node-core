/**
 * @module clientErrors
 */
/** */
import { Exception } from '../Exception';

export class Conflict extends Exception {

  public name = 'CONFLICT';

  constructor (message: string) {
    super(409, message);
  }
}
