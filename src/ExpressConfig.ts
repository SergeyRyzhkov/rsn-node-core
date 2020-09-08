import { ModuleOptions } from '@/ConfigManager';

export class ExpressConfig extends ModuleOptions {
    port = 3003;
    host = "http://localhost:3003";
    restApiBaseUrl = "/api/2_0";
    bodyParserLimit = "50mb";

    useCors = true;
    corsOptions = {
        credentials: true,
        origin: true
    }
}
