/**
 * @module redirections
 */
/** */
import {Exception} from '../Exception';

export class MovedPermanently extends Exception {

    public name: string = 'MOVED_PERMANENTLY';

    constructor(message: string) {
        super(301, message);
    }
}
