/**
 * @module serverErrors
 */
/** */
import {Exception} from '../Exception';

export class VariantAlsoNegotiates extends Exception {

    public name = 'VARIANT_ALSO_NEGOTIATES';

    constructor(message: string) {
        super(506, message);
    }
}
