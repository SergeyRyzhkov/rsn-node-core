import AppConfig from './utils/Config';

export const ClientAppConfig = {

  defaultRowsLimit: 6,
  showCookieNotice: false,
  adminRoleName: 'admin',
  cookieName: AppConfig.authConfig.cookieName,
  jwtHeaderName: AppConfig.authConfig.jwtHeaderName,

  enabledAuthProviders: [
  ],

  sorts: [

  ]

}
export default ClientAppConfig
