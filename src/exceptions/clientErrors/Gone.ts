/**
 * @module clientErrors
 */
/** */
import { Exception } from '../Exception';

export class Gone extends Exception {

  public name = 'GONE';

  constructor (message: string) {
    super(410, message);
  }
}
