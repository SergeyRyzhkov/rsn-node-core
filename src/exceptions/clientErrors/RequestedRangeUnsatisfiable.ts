/**
 * @module clientErrors
 */
/** */
import { Exception } from '../Exception';

export class RequestedRangeUnsatisfiable extends Exception {

  public name = 'REQUESTED_RANGE_UNSATISFIABLE';

  constructor (message: string) {
    super(416, message);
  }
}
