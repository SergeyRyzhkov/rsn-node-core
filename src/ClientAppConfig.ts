import { AppConfig } from './utils/Config';

//FIXME:Как класс ?
export const ClientAppConfig = {

  defaultRowsLimit: 6,
  showCookieNotice: false,
  adminRoleName: 'admin',
  cookieName: AppConfig.authConfig ? AppConfig.authConfig.cookieName : 'auth-rsn-cookie',
  jwtHeaderName: AppConfig.authConfig ? AppConfig.authConfig.jwtHeaderName : 'auth-rsn-header',

  enabledAuthProviders: [
  ],

  sorts: [

  ]

}

