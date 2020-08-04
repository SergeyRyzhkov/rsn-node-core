/**
 * @module clientErrors
 */
/** */
import { Exception } from '../Exception';

export class MethodNotAllowed extends Exception {

  public name = 'METHOD_NOT_ALLOWED';

  constructor (message: string) {
    super(405, message);
  }
}
