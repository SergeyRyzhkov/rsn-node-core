/**
 * @module serverErrors
 */
/** */
import {Exception} from '../Exception';

export class GatewayTimeout extends Exception {

    public name = 'GATEWAY_TIMEOUT';

    constructor(message: string) {
        super(504, message);
    }
}
