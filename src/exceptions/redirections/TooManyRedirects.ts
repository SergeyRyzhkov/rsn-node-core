/**
 * @module redirections
 */
/** */
import {Exception} from '../Exception';

export class TooManyRedirects extends Exception {

    public name = 'TOO_MANY_REDIRECTS';

    constructor(message: string) {
        super(310, message);
    }
}
