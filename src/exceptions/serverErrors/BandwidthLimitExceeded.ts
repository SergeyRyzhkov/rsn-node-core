/**
 * @module serverErrors
 */
/** */
import {Exception} from '../Exception';

export class BandwidthLimitExceeded extends Exception {

    public name = 'BANDWIDTH_LIMIT_EXCEEDED';

    constructor(message: string) {
        super(509, message);
    }
}
