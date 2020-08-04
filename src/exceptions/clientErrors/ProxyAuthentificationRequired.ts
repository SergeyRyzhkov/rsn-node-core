/**
 * @module clientErrors
 */
/** */
import { Exception } from '../Exception';

export class ProxyAuthentificationRequired extends Exception {

  public name = 'PROXY_AUTHENTIFICATION_REQUIRED';

  constructor (message: string) {
    super(407, message);
  }
}
