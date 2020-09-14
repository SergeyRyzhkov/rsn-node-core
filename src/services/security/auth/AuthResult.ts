import { Exception } from '@/exceptions/Exception';
import { SessionUser } from '../../../models/security/SessionUser';
// import { Exception } from '../../exceptions/Exception';

// FIXME: Может быть подтверждение и по почтовому коду
// FIXME: Отдельно учесь неверный код подтверждения и или истек срок действия (это разные? д.б.)
export enum LogonStatus {
  OK,
  ShouldChangePassword,
  UserNotFoundButSocialNetworkAuthOK,
  Failed,
  Blocked,
  Error,
  Unknown,
  RequereConfirmBySmsCode,
  RegistrationNotConfirmed,
  PasswordChanged
}

export class AuthResult {
  public sessionUser: SessionUser = SessionUser.anonymousUser;
  public logonStatus: LogonStatus = LogonStatus.Unknown;
  public exception: Exception = null;
  public message: string;
  public newAccessToken: string;

  public makeOK (sessionUser: SessionUser, message: string) {
    this.logonStatus = LogonStatus.OK;
    this.exception = null;
    this.sessionUser = sessionUser;
    this.message = message;
    return this;
  }

  public makeShouldChangePassword (sessionUser: SessionUser) {
    this.logonStatus = LogonStatus.ShouldChangePassword;
    this.exception = null;
    this.sessionUser = sessionUser;
    return this;
  }

  public makeUserNotFoundButSocialNetworkAuthOk (sessionUser: SessionUser) {
    this.logonStatus = LogonStatus.UserNotFoundButSocialNetworkAuthOK;
    this.sessionUser = sessionUser;
    return this;
  }

  public makeFailed (message?: string) {
    this.logonStatus = LogonStatus.Failed;
    this.sessionUser = SessionUser.anonymousUser;
    this.message = message;
    return this;
  }

  public makeBlocked (message: string) {
    this.logonStatus = LogonStatus.Blocked;
    this.sessionUser = SessionUser.anonymousUser;
    this.message = message;
    return this;
  }

  public makeRegistrationNotConfirmed (message: string) {
    this.logonStatus = LogonStatus.RegistrationNotConfirmed;
    this.sessionUser = SessionUser.anonymousUser;
    this.message = message;
    return this;
  }


  public makeError (exception: Exception) {
    this.logonStatus = LogonStatus.Error;
    this.exception = exception;
    this.sessionUser = SessionUser.anonymousUser;
    return this;
  }

  public makeRequereConfirmBySmsCode (sessionUser: SessionUser, message: string) {
    this.logonStatus = LogonStatus.RequereConfirmBySmsCode;
    this.sessionUser = sessionUser;
    this.message = message;
    return this;
  }

  public makePasswordChanged (sessionUser: SessionUser) {
    this.logonStatus = LogonStatus.PasswordChanged;
    this.sessionUser = sessionUser;
    return this;
  }

}
