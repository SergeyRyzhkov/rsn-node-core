import { Exception } from '../Exception';

export class UserSessionExpiredException extends Exception {

  public name = 'SESSION_EXPIRED';

  constructor(message?: string) {
    super(message);
  }
}
