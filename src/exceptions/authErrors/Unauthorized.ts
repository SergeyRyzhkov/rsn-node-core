
import { Exception } from '../Exception';

export class Unauthorized extends Exception {

  public name: string = 'UNAUTHORIZED';

  constructor (message: string) {
    super(401, message);
  }
}
