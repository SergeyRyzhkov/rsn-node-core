import { AppController } from './controllers/AppController';
import { AuthController } from './controllers/security/AuthController';
import { RegistrationController } from './controllers/security/RegistrationController';
import { ResetPasswordController } from './controllers/security/ResetPasswordController';
import { AppUser } from './models/security/AppUser';
import { AppUserSession } from './models/security/AppUserSession';
import { AppUserSocialNetProfile } from './models/security/AppUserSocialNetProfile';
import { ExpressApplication } from './ExpressApplication';
import { ServiceRegistry } from './ServiceRegistry';
import { AuthService } from './services/security/auth/AuthService';
import { RegistrationService } from './services/security/registration/RegistrationService';
import { ResetPasswordService } from './services/security/reset/ResetPasswordService';
import { AppUserSessionService } from './services/security/user/AppUserSessionService';
import { AppUserService } from './services/security/user/AppUserService';
import { ConfigManager } from './ConfigManager';
import { ExpressConfig } from './ExpressConfig';
import { DatabaseConfig } from './DatabaseConfig';
import { SmtpOptions } from './services/mail/SmtpOptions';
import { SecurityConfig } from './services/security/SecurityConfig';


export class TestApp {

    // public async start () {
    //     const app: ExpressApplication = new ExpressApplication();
    //     await app.start();
    // }
}

// (async () => {
//     new TestApp().start();
// }
// )()