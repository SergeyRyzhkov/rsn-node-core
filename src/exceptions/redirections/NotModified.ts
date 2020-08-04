/**
 * @module redirections
 */
/** */
import {Exception} from '../Exception';

export class NotModified extends Exception {

    public name = 'NOT_MODIFIED';

    constructor(message: string) {
        super(304, message);
    }
}
