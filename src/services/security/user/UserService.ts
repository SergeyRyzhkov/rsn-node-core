import { BaseService } from '../../BaseService';
import { TypeOrmManager } from '@/TypeOrmManager';
import { postgresWrapper } from '@/PostgresWrapper';
import { AppUserSocialNetProfile } from '@/models/security/AppUserSocialNetProfile';
import { plainToClass } from 'class-transformer';
import { AppUser } from '../../../models/security/AppUser';
import { SessionUser } from './SessionUser';

// FIXME: все вьюхи можно заменить на 
// create view t_view AS
//     select a, b from t;

// CREATE FUNCTION t_func (c int) RETURNS TABLE(a int, b int) AS '
//    select a, b from t where c = $1;
// ' LANGUAGE SQL;


// SELECT * FROM t_view WHERE c = 1;

// SELECT * FROM t_func (1); 

export class UserService extends BaseService {

  public async getById (userId: number) {
    const dbResult = await postgresWrapper.oneOrNoneWhere('v_api_app_user', 'app_user_id=$1', [userId]);
    return plainToClass(AppUser, dbResult)
  }

  public async getByLogin (login: string) {
    if (!login || login === undefined) {
      return null;
    }
    const dbResult = await postgresWrapper.oneOrNoneWhere('v_api_app_user', 'LOWER(app_user_login)=$1', [login.trim().toLowerCase()]);
    return plainToClass(AppUser, dbResult)
  }

  public async getByPhone (phone: string) {
    if (!phone || phone === undefined) {
      return null;
    }
    const dbResult = await postgresWrapper.oneOrNoneWhere('v_api_app_user', 'LOWER(app_user_phone)=$1', [phone.trim().toLowerCase()]);
    return plainToClass(AppUser, dbResult)
  }
  appUser

  public async getByEmailCode (token: string | number) {
    const dbResult = await postgresWrapper.oneOrNoneWhere('v_api_app_user', 'app_user_reg_token=$1', [token]);
    return plainToClass(AppUser, dbResult)
  }

  public async getBySmsCode (code: number) {
    const dbResult = await postgresWrapper.oneOrNoneWhere('app_user', 'app_user_sms_code=$1', [code]);
    return plainToClass(AppUser, dbResult)
  }

  public async getByResetPasswordToken (token: string) {
    const dbResult = await postgresWrapper.oneOrNoneWhere('v_api_app_user', 'app_user_reset_pwd=$1', [token]);
    return plainToClass(AppUser, dbResult)
  }

  public async getSessionUserByProfileCode (profileType: string, profileCode: number) {
    const dbResult = await postgresWrapper.oneOrNoneWhere('v_api_app_user_social_net_profile', 'user_sn_profile_code=$1 and user_sn_profile_type=$2', [profileCode, profileType]);
    if (!dbResult) {
      return null;
    }

    const profile = plainToClass(AppUserSocialNetProfile, dbResult)
    const result = this.convertAppUserSocialNetProfileToSessionUser(profile)

    return result;
  }

  // Сохранить
  public async save (appUser: AppUser) {
    return TypeOrmManager.EntityManager.save(appUser);
  }

  // Удалить
  public async delete (userId: number) {
    const delWhere = 'app_user_id=$1';
    return postgresWrapper.delete('app_user', delWhere, [userId]);
  }

  public async linkSessionUserToSocialNetwork (authStrategyType: string, sessionUser: SessionUser) {
    if (sessionUser.appUserId > 0 && sessionUser.userSnProfileId > 0 && authStrategyType) {
      const dbResult = await postgresWrapper.oneOrNoneWhere('v_api_app_user_social_net_profile', 'user_sn_profile_code=$1 and user_sn_profile_type=$2', [sessionUser.userSnProfileId, authStrategyType]);
      const tryProfile = plainToClass(AppUserSocialNetProfile, dbResult)

      const newAppUserSocialNetProfile: AppUserSocialNetProfile = tryProfile ? tryProfile : new AppUserSocialNetProfile();
      newAppUserSocialNetProfile.appUserId = sessionUser.appUserId;
      newAppUserSocialNetProfile.userSnProfileCode = sessionUser.userSnProfileId;
      newAppUserSocialNetProfile.userSnProfileType = authStrategyType;
      newAppUserSocialNetProfile.userSnProfileLink = sessionUser.userSnProfileLink;
      newAppUserSocialNetProfile.userSnProfileAvatar = sessionUser.userSnProfileAvatar;
      newAppUserSocialNetProfile.userSnProfileEmail = sessionUser.userSnProfileEmail;
      newAppUserSocialNetProfile.userSnProfileNick = sessionUser.userSnProfileNick;

      return TypeOrmManager.EntityManager.save(newAppUserSocialNetProfile);
    }
  }

  public async linkToSocialNetwork (userId: number, authStrategyType: string, profile: any) {
    if (userId > 0 && profile.id) {
      const tempSessionUser = this.convertProfileToSessionUser(authStrategyType, profile);
      if (tempSessionUser) {
        tempSessionUser.appUserId = userId;
        return this.linkSessionUserToSocialNetwork(authStrategyType, tempSessionUser);
      }
    }
    return null;
  }

  public convertAppUserToSessionUser (appUser: AppUser) {
    const result = new SessionUser();
    result.appUserId = appUser.appUserId;
    result.appUserLogin = appUser.appUserLogin;
    result.appUserRegVerifiedInd = appUser.appUserRegVerifiedInd;
    result.appUserRegDate = appUser.appUserRegDate;
    return result;
  }

  public convertAppUserSocialNetProfileToSessionUser (appUserSocialNetProfile: AppUserSocialNetProfile) {
    const result = new SessionUser();
    result.appUserId = appUserSocialNetProfile.appUserId;
    result.userSnProfileEmail = appUserSocialNetProfile.userSnProfileEmail;
    result.userSnProfileAvatar = appUserSocialNetProfile.userSnProfileAvatar;
    result.userSnProfileId = appUserSocialNetProfile.userSnProfileCode;
    result.userSnProfileNick = appUserSocialNetProfile.userSnProfileNick
    result.userSnProfileType = appUserSocialNetProfile.userSnProfileType;
    result.userSnProfileLink = appUserSocialNetProfile.userSnProfileLink;
    result.appUserLogin = appUserSocialNetProfile.appUserEmail;

    return result;
  }

  public convertProfileToSessionUser (authStrategyType: string, profile: any) {
    const result = new SessionUser();
    if (profile) {
      result.appUserId = 0;
      result.userSnProfileId = profile.id;
      result.userSnProfileType = authStrategyType;
      result.userSnProfileLink = profile.profileUrl;
      result.userSnProfileAvatar = profile.photos && profile.photos.length && profile.photos.length > 0 ? profile.photos[0].value : '';
      result.userSnProfileEmail = profile.email ? profile.email : (profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null);
      result.userSnProfileNick = profile.displayName;
      result.appUserLogin = (result.userSnProfileEmail && result.userSnProfileEmail !== undefined && result.userSnProfileEmail !== 'undefined') ? result.userSnProfileEmail : '';
    }
    return result;
  }
}
