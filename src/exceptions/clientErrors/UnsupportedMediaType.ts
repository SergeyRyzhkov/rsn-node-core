/**
 * @module clientErrors
 */
/** */
import {Exception} from '../Exception';

export class UnsupportedMediaType extends Exception {

    public name: string = 'UNSUPPORTED_MEDIA_TYPE';

    constructor(message: string) {
        super(415, message);
    }
}
