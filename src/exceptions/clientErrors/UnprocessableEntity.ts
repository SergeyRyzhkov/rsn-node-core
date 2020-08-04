/**
 * @module clientErrors
 */
/** */
import {Exception} from '../Exception';

export class UnprocessableEntity extends Exception {

    public name = 'UNPROCESSABLE_ENTITY';

    constructor(message: string) {
        super(422, message);
    }
}
