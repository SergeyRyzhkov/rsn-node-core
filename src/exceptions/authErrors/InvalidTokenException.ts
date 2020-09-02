import { Exception } from '../Exception';
import { Unauthorized } from './Unauthorized';


export class InvalidTokenException extends Unauthorized {

  public name = 'INVALID_TOKEN';

}
