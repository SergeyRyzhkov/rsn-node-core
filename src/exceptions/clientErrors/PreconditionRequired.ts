/**
 * @module clientErrors
 */
/** */
import { Exception } from '../Exception';

export class PreconditionRequired extends Exception {

  public name = 'PRECONDITION_REQUIRED';

  constructor (message: string) {
    super(428, message);
  }
}
