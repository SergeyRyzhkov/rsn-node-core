import * as passport from 'passport';
import * as facebook from 'passport-facebook';
import * as google from 'passport-google-oauth2';
import * as passportLocal from 'passport-local';
import * as yandex from 'passport-yandex';
import AppConfig from '@/utils/Config';
import ServiceContainer from '../ServiceContainer';
import ClientAppConfig from '@/ClientAppConfig';


interface PassportStrategyDescriptor {
  authType: string;
  name: string;
  borderColor: string;
  backgroundColor: string;
  iconClass: string;
}


export default class PassportProviders {
  public static LOCAL = 'login';

  public static getProviderNameByAuthType (authType: string) {
    const tryFind = ClientAppConfig.enabledAuthProviders.find((x) => x.authType === authType);
    return tryFind ? tryFind.name : null;
  }

  public initialize (config: any) {
    this.initLocalStrategy();
    const google = this.initGoogleStrategy();
    const facebook = this.initFacebookStrategy();
    const yandex = this.initYandexStrategy();
    config.enabledAuthProviders = [yandex, google, facebook];
  }

  // =====
  private initLocalStrategy () {
    const strategy = new passportLocal.Strategy(AppConfig.authConfig.Local,
      (req, username, password, done) =>
        ServiceContainer.AuthService.verifyByPassword(username, password, req.body.unlinkedSocialUser, done)
    );
    passport.use(PassportProviders.LOCAL, strategy);
  }

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
        ServiceContainer.AuthService.verifyBySocialNetwork(strategyDescriptor.authType, profile, done)
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
        ServiceContainer.AuthService.verifyBySocialNetwork(strategyDescriptor.authType, profile, done)
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
        ServiceContainer.AuthService.verifyBySocialNetwork(strategyDescriptor.authType, profile, done)
      }
    );
    passport.use(strategyDescriptor.authType, strategy);
    return strategyDescriptor;
  }
}
