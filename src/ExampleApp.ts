// import { ExpressApplication } from './ExpressApplication';
// import { serviceRegistry } from './ServiceRegistry';
// import { ResetChangePwdService } from './services/security/reset/ResetChangePwdService';
// import { UserService } from './services/security/user/UserService';
// import { UserSessionService } from './services/security/user/UserSessionService';
// import { AuthService } from './services/security/auth/AuthService';
// import { RegistrationService } from './services/security/registration/RegistrationService';
// import { PassportProviders } from './services/security/PassportProviders';
// import { AppController } from './controllers/AppController';
// import { AuthController } from './controllers/security/AuthController';
// import { RegistrationController } from './controllers/security/RegistrationController';
// import { ResetChangePwdController } from './controllers/security/ResetChangePwdController';
// import { AppUser } from './models/security/AppUser';
// import { AppUserSession } from './models/security/AppUserSession';
// import { AppUserSocialNetProfile } from './models/security/AppUserSocialNetProfile';

// class ExampleApp {

//     public async start () {
//         const controllers = [AppController, AuthController, RegistrationController, ResetChangePwdController];
//         const entities = [AppUser, AppUserSession, AppUserSocialNetProfile];

//         const app: ExpressApplication = new ExpressApplication();

//         serviceRegistry.register(UserService).
//             register(UserSessionService).
//             register(AuthService).
//             register(RegistrationService).
//             register(ResetChangePwdService).
//             register(PassportProviders);

//         app.addAppControllers(controllers).addTypeOrmEntityMetadata(entities);

//         await app.start();

//         // const result = await new RegistrationService().registerNewUser('79218941537', 'SergeyRyzhkov76@gmail.comU1', null);
//         //  new RegistrationService().confirmRegistrationByEmail(token)
//         // const result1 = await new RegistrationService().confirmRegistrationByEmail('90c52480-0449-4e3a-81e0-804fff7a4391');

//         // const result2 = await new RegistrationService().confirmRegistrationBySms(55555, 21)

//         // const rr = '';

//     }
// }

// (async () => {
//     new ExampleApp().start();
// }
// )()