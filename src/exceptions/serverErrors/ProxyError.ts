/**
 * @module serverErrors
 */
/** */
import {Exception} from '../Exception';

export class ProxyError extends Exception {

    public name: string = 'PROXY_ERROR';

    constructor(message: string) {
        super(502, message);
    }
}
