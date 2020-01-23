/**
 * @module clientErrors
 */
/** */
import { Exception } from '../Exception';

export class Conflict extends Exception {

  public name: string = 'CONFLICT';

  constructor (message: string) {
    super(409, message);
  }
}
