import { BaseService } from '../BaseService';
import { AppUser } from '../../entities/users/AppUser';
import { TypeOrmManager } from '@/utils/TypeOrmManager';
import { PgUtls } from '@/utils/PgUtils';
import { AppUserSocialNetProfile } from '@/entities/users/AppUserSocialNetProfile';
import { SessionUser } from '../../entities/users/SessionUser';

export class UserService extends BaseService {

  public async getById (userId: number) {
    const dbResult = await PgUtls.getOneFromDatabse('v_api_app_user', 'app_user_id=$1', [userId]);
    return this.getOneEntityInstanceFromJson(dbResult, AppUser);
  }

  public async getByEmail (email: string) {
    if (!email || email === undefined) {
      return null;
    }

    const dbResult = await PgUtls.getOneFromDatabse('v_api_app_user', 'LOWER(app_user_email)=$1', [email.trim().toLowerCase()]);
    return this.getOneEntityInstanceFromJson(dbResult, AppUser);
  }

  public async getByRegistrationToken (token: string) {
    const dbResult = await PgUtls.getOneFromDatabse('v_api_app_user', 'app_user_reg_token=$1', [token]);
    return this.getOneEntityInstanceFromJson(dbResult, AppUser);
  }

  public async getByResetPasswordToken (token: string) {
    const dbResult = await PgUtls.getOneFromDatabse('v_api_app_user', 'app_user_reset_pwd=$1', [token]);
    return this.getOneEntityInstanceFromJson(dbResult, AppUser);
  }

  public async getSessionUserByProfileCode (profileType: string, profileCode: number) {
    const dbResult = await PgUtls.getOneFromDatabse('v_api_app_user_social_net_profile', 'user_sn_profile_code=$1 and user_sn_profile_type=$2', [profileCode, profileType]);
    if (!dbResult) {
      return null;
    }

    const profile = this.getOneEntityInstanceFromJson(dbResult, AppUserSocialNetProfile);
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
    return PgUtls.delete('app_user', delWhere, [userId]);
  }

  public async linkSessionUserToSocialNetwork (authStrategyType: string, sessionUser: SessionUser) {
    if (sessionUser.appUserId > 0 && sessionUser.userSnProfileId > 0 && authStrategyType) {
      const dbResult = await PgUtls.getOneFromDatabse('v_api_app_user_social_net_profile', 'user_sn_profile_code=$1 and user_sn_profile_type=$2', [sessionUser.userSnProfileId, authStrategyType]);
      const tryProfile = this.getOneEntityInstanceFromJson(dbResult, AppUserSocialNetProfile);

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
    result.appUserEmail = appUser.appUserEmail;
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
    result.appUserEmail = appUserSocialNetProfile.appUserEmail;

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
      result.appUserEmail = (result.userSnProfileEmail && result.userSnProfileEmail !== undefined && result.userSnProfileEmail !== 'undefined') ? result.userSnProfileEmail : '';
    }
    return result;
  }
}
