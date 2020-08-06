import { Exception } from '../Exception';


export class InvalidTokenException extends Exception {

  public name = 'INVALID_TOKEN';

  constructor(message?: string) {
    super(message);
  }
}
