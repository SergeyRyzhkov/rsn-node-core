import { BaseService } from '../../BaseService';
import { AppUserSession } from '@/models/security/AppUserSession';
import { TypeOrmManager } from '@/utils/TypeOrmManager';
import { postgresWrapper } from '@/utils/PostgresWrapper';
import { Guid } from '@/utils/Guid';
import { plainToClass } from 'class-transformer';
import { SessionUser } from '@/models/security/SessionUser';
import { JWTHelper } from '../JWTHelper';
import { ConfigManager } from '@/ConfigManager';
import { SecurityConfig } from '../SecurityConfig';

export class AppUserSessionService extends BaseService {

  private securityConfig = ConfigManager.instance.getOptions(SecurityConfig);

  public async getByToken (token: string) {
    const dbResult = await postgresWrapper.oneOrNoneWhere('app_user_session', 'user_session_token=$1', [token]);
    return plainToClass(AppUserSession, dbResult)
  }


  public async getByUser (appUserId: number) {
    return postgresWrapper.anyWhere('app_user_session', null, 'app_user_id=$1', [appUserId]);
  }


  // FIXME: В настройки параметры
  // FIXME: Учесть возможность сессий с разных устройств (ip)
  public async saveUserSessionAndCreateJwt (sessionUser: SessionUser) {
    // Почитсим старые сессии
    await this.deleteAllByUser(sessionUser.appUserId);

    // Создаем в БД новую запись о сессии
    const sesionToken = Guid.newGuid();
    const result = new AppUserSession();
    result.appUserId = sessionUser.appUserId;
    result.userSessionToken = sesionToken;
    result.userSessionCreatedAt = new Date(Date.now()).toUTCString();
    result.userSessionExpiredAt = new Date(Date.now() + this.securityConfig.refreshTokenAgeInSeconds * 1000).toUTCString();
    await this.save(result);

    const newAccessToken = JWTHelper.createAndSignJwt(sessionUser, sesionToken);
    return newAccessToken;
  }

  public async refreshSession (existsSession: AppUserSession) {
    existsSession.userSessionToken = Guid.newGuid();
    existsSession.userSessionUpdatedAt = new Date(Date.now()).toUTCString();
    existsSession.userSessionExpiredAt = new Date(Date.now() + this.securityConfig.refreshTokenAgeInSeconds * 1000).toUTCString();
    return this.save(existsSession);
  }

  public async save (appUserSession: AppUserSession) {
    return TypeOrmManager.EntityManager.save(appUserSession);
  }

  // public async delete (token: string) {
  //   const delWhere = 'user_session_token=$1';
  //   return postgresWrapper.delete('app_user_session', delWhere, [token]);
  // }

  public async deleteAllByUser (appUserId: number) {
    const delWhere = 'app_user_id=$1';
    return postgresWrapper.delete('app_user_session', delWhere, [appUserId]);
  }

  public async lockSession (token: string) {
    const update = 'UPDATE app_user_session SET user_session_block_ind = 1 WHERE user_session_token=$1';
    return postgresWrapper.execNone(update, [token]);
  }

  public async lockAllUserSession (appUserId: number) {
    const update = 'UPDATE app_user_session SET user_session_block_ind = 1 WHERE app_user_id=$1';
    return postgresWrapper.execNone(update, [appUserId]);
  }

  public isExpired (session: AppUserSession) {
    return Date.now() - Date.parse(session.userSessionExpiredAt) > this.securityConfig.refreshTokenAgeInSeconds * 1000;
  }
}
