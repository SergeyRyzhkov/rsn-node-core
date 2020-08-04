/**
 * @module clientErrors
 */
/** */
import { Exception } from '../Exception';

export class PreconditionFailed extends Exception {

  public name = 'PRECONDITION_FAILED';

  constructor (message: string) {
    super(412, message);
  }
}
