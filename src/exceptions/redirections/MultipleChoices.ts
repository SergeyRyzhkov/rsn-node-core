/**
 * @module redirections
 */
/** */
import {Exception} from '../Exception';

export class MultipleChoices extends Exception {

    public name = 'MULTIPLE_CHOICES';

    constructor(message: string) {
        super(300, message);
    }
}
