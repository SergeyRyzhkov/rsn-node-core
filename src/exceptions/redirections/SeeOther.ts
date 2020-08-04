/**
 * @module redirections
 */
/** */
import {Exception} from '../Exception';

export class SeeOther extends Exception {

    public name = 'SEE_OTHER';

    constructor(message: string) {
        super(303, message);
    }
}
