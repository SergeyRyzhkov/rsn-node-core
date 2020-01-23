/**
 * @module clientErrors
 */
/** */
import { Exception } from '../Exception';

export class PreconditionFailed extends Exception {

  public name: string = 'PRECONDITION_FAILED';

  constructor (message: string) {
    super(412, message);
  }
}
