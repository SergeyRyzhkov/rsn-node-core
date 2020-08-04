/**
 * @module clientErrors
 */
/** */
import {Exception} from '../Exception';

export class UpgradeRequired extends Exception {

    public name = 'UPGRADE_REQUIRED';

    constructor(message: string) {
        super(426, message);
    }
}
