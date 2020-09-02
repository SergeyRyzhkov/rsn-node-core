import { AppController } from './controllers/AppController';
import { AuthController } from './controllers/security/AuthController';
import { RegistrationController } from './controllers/security/RegistrationController';
import { ResetChangePwdController } from './controllers/security/ResetChangePwdController';
import { AppUser } from './models/security/AppUser';
import { AppUserSession } from './models/security/AppUserSession';
import { AppUserSocialNetProfile } from './models/security/AppUserSocialNetProfile';
import { ExpressApplication } from './ExpressApplication';
import { ServiceRegistry } from './ServiceRegistry';
import { AuthService } from './services/security/auth/AuthService';
import { RegistrationService } from './services/security/registration/RegistrationService';
import { ResetChangePwdService } from './services/security/reset/ResetChangePwdService';
import { PassportProviders } from './services/security/PassportProviders';
import { AppUserSessionService } from './services/security/user/AppUserSessionService';
import { AppUserService } from './services/security/user/AppUserService';

export class ExampleApp {

    public async start () {
        const controllers = [AppController, AuthController, RegistrationController, ResetChangePwdController];
        const entities = [AppUser, AppUserSession, AppUserSocialNetProfile];

        const app: ExpressApplication = new ExpressApplication();

        ServiceRegistry.instance.register(AppUserService).
            register(AppUserSessionService).
            register(AuthService).
            register(RegistrationService).
            register(ResetChangePwdService).
            register(PassportProviders);

        app.addAppControllers(controllers).addTypeOrmEntityMetadata(entities);

        await app.start();

    }
}

(async () => {
    new ExampleApp().start();
}
)()