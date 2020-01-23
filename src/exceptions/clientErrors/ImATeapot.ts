/**
 * @module clientErrors
 */
/** */
import { Exception } from '../Exception';

export class ImATeapot extends Exception {

  public name: string = 'IM_A_TEAPOT';

  constructor (message: string) {
    super(418, message);
  }
}
