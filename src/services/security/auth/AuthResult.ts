import { Exception } from '@/exceptions/Exception';
import { SessionUser } from '../user/SessionUser';
// import { Exception } from '../../exceptions/Exception';

export enum LogonStatus {
  OK,
  ShouldChangePassword,
  UserNotFoundButSocialNetworkAuthOK,
  Failed,
  Blocked,
  Error,
  Unknown,
  RequereConfirmBySmsCode
}

export class AuthResult {
  public sessionUser: SessionUser = SessionUser.anonymousUser;
  public logonStatus: LogonStatus = LogonStatus.Unknown;
  public exception: Exception = null;
  public message: string;
  public newAccessToken: string;

  public makeUnknownResult () {
    this.logonStatus = LogonStatus.Unknown;
  }

  public makeOKResult (sessionUser: SessionUser, message: string) {
    this.logonStatus = LogonStatus.OK;
    this.exception = null;
    this.sessionUser = sessionUser;
    this.message = message;
    return this;
  }

  public makeShouldChangePasswordResult (sessionUser: SessionUser) {
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

  public makeFailedResult (message?: string) {
    this.logonStatus = LogonStatus.Failed;
    this.sessionUser = SessionUser.anonymousUser;
    this.message = message;
    return this;
  }

  public makeBlockedResult (message: string) {
    this.logonStatus = LogonStatus.Blocked;
    this.sessionUser = SessionUser.anonymousUser;
    this.message = message;
    return this;
  }

  public makeErrorResult (exception: Exception) {
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
}
