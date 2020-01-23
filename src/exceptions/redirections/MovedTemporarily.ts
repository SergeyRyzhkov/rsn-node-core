/**
 * @module redirections
 */
/** */
import {Exception} from '../Exception';

export class MovedTemporarily extends Exception {

    public name: string = 'MOVED_TEMPORARILY';

    constructor(message: string) {
        super(302, message);
    }
}
