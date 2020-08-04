/**
 * @module serverErrors
 */
/** */
import {Exception} from '../Exception';

export class NotExtended extends Exception {

    public name = 'NOT_EXTENDED';

    constructor(message: string) {
        super(510, message);
    }
}
