/**
 * @module clientErrors
 */
/** */
import { Exception } from '../Exception';

export class MisdirectedRequest extends Exception {

  public name = 'MISDIRECTED_REQUEST';

  constructor (message: string) {
    super(421, message);
  }
}
