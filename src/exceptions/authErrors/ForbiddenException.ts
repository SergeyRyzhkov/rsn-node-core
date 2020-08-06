import { Exception } from '../Exception';

export class ForbiddenException extends Exception {

  public name = 'FORBIDDEN_EXCEPTION';

  constructor(message?: string) {
    super(403, message);
  }
}
