/**
 * @module clientErrors
 */
/** */
import {Exception} from '../Exception';

export class UnavailabledForLegalReasons extends Exception {

    public name = 'UNAVAILABLED_FOR_LEGAL_REASONS';

    constructor(message: string) {
        super(451, message);
    }
}
