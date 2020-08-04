import passport from 'passport';
import facebook from 'passport-facebook';
import google from 'passport-google-oauth2';
import passportLocal from 'passport-local';
import yandex from 'passport-yandex';
import { AppConfig } from '@/utils/Config';
import { BaseService } from '../BaseService';
import { serviceRegistry } from '../../ServiceRegistry';
import { AuthService } from './auth/AuthService';


interface PassportStrategyDescriptor {
  authType: string;
  name: string;
  borderColor: string;
  backgroundColor: string;
  iconClass: string;
}


export class PassportProviders extends BaseService {
  public static LOCAL = 'login';

  public static getProviderNameByAuthType (authType: string) {
    // const tryFind = ClientAppConfig.enabledAuthProviders.find((x) => x.authType === authType);
    // return tryFind ? tryFind.name : null;

    return true
  }

  public initialize () {
    //  this.initLocalStrategy();
    const google = this.initGoogleStrategy();
    const facebook = this.initFacebookStrategy();
    const yandex = this.initYandexStrategy();
    //    config.enabledAuthProviders = [yandex, google, facebook];
  }

  // FIXME: unlinkedSocialUser - как-то криво, может это в контроллера надо делать?
  // private initLocalStrategy () {
  //   const strategy = new passportLocal.Strategy(AppConfig.authConfig.Local,
  //     (req, username, password, done) =>
  //       serviceRegistry.getService(AuthService).loginByPassword(username, password, req.body.unlinkedSocialUser, done)
  //   );
  //   passport.use(PassportProviders.LOCAL, strategy);
  // }

  private initGoogleStrategy () {
    const strategyDescriptor: PassportStrategyDescriptor = {
      authType: 'google',
      name: 'Google+',
      borderColor: '#dd4b39',
      backgroundColor: '#dd4b39',
      iconClass: 'fab fa-google'
    }

    const strategy = new google.Strategy(AppConfig.authConfig.Google,
      (req, accessToken, refreshToken, profile, done) => {
        serviceRegistry.getService(AuthService).loginBySocialNetwork(strategyDescriptor.authType, profile, done)
      }
    );
    passport.use(strategyDescriptor.authType, strategy);
    return strategyDescriptor;
  }

  private initFacebookStrategy () {
    const strategyDescriptor: PassportStrategyDescriptor = {
      authType: 'facebook',
      name: 'Facebook',
      borderColor: '#3b5997',
      backgroundColor: '#3b5997',
      iconClass: 'fab fa-facebook-f'
    }

    const strategy = new facebook.Strategy(AppConfig.authConfig.Facebook,
      (req, accessToken, refreshToken, profile, done) => {
        serviceRegistry.getService(AuthService).loginBySocialNetwork(strategyDescriptor.authType, profile, done)
      }
    );
    passport.use(strategyDescriptor.authType, strategy);
    return strategyDescriptor;
  }

  private initYandexStrategy () {
    const strategyDescriptor: PassportStrategyDescriptor = {
      authType: 'yandex',
      name: 'Yandex',
      borderColor: '#ffcc00',
      backgroundColor: '#ffcc00',
      iconClass: 'fab fa-yandex'
    }

    const strategy = new yandex.Strategy(AppConfig.authConfig.Yandex,
      (accessToken, refreshToken, profile, done) => {
        serviceRegistry.getService(AuthService).loginBySocialNetwork(strategyDescriptor.authType, profile, done)
      }
    );
    passport.use(strategyDescriptor.authType, strategy);
    return strategyDescriptor;
  }
}
