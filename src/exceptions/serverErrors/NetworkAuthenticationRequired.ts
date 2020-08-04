/**
 * @module serverErrors
 */
/** */
import {Exception} from '../Exception';

export class NetworkAuthenticationRequired extends Exception {

    public name = 'NETWORK_AUTHENTICATION_REQUIRED';

    constructor(message: string) {
        super(511, message);
    }
}
