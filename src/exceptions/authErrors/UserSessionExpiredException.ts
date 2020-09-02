import { Exception } from '../Exception';
import { Unauthorized } from './Unauthorized';

export class UserSessionExpiredException extends Unauthorized {

  public name = 'SESSION_EXPIRED';

}
