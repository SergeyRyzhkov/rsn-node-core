/**
 * @module redirections
 */
/** */
import {Exception} from '../Exception';

export class TemporaryRedirect extends Exception {

    public name = 'TEMPORARY_REDIRECT';

    constructor(message: string) {
        super(307, message);
    }
}
