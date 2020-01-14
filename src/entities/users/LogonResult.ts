import SessionUser from './SessionUser';
import { Exception } from '@/exceptions/Exception';

export const enum LogonStatus {
  OK,
  ShouldChangePassword,
  UserNotFoundButSocialNetworkAuthOK,
  Failed,
  Blocked,
  Error,
  Logoff,
  Unknown
};

export class LogonResult {
  public sessionUser: SessionUser = SessionUser.anonymousUser;
  public logonStatus: LogonStatus = LogonStatus.Unknown;
  public exception: Exception = null;
  public message: string;

  public makeUnknownResult () {
    this.logonStatus = LogonStatus.Unknown;
  }

  public makeOKResult (sessionUser: SessionUser) {
    this.logonStatus = LogonStatus.OK;
    this.exception = null;
    this.sessionUser = sessionUser;
  }

  public makeShouldChangePasswordResult (sessionUser: SessionUser) {
    this.logonStatus = LogonStatus.ShouldChangePassword;
    this.exception = null;
    this.sessionUser = sessionUser;
  }

  public makeUserNotFoundButSocialNetworkAuthOk (sessionUser: SessionUser, socialNetworkName: string) {
    this.logonStatus = LogonStatus.UserNotFoundButSocialNetworkAuthOK;
    this.sessionUser = sessionUser;
    this.message = `Профиль не связан с какой-либо учетной записью на сайте. Войдите на сайт или зарегистрируйтесь, чтобы заходить в один аккаунт вводя логин и пароль или используя ${socialNetworkName}`;
  }

  public makeFailedResult () {
    this.logonStatus = LogonStatus.Failed;
    this.sessionUser = SessionUser.anonymousUser;
    this.message = 'Ошибка входа. Неверный идентификатор пользователя или пароль';
  }

  public makeBlockedResult () {
    this.logonStatus = LogonStatus.Blocked;
    this.sessionUser = SessionUser.anonymousUser;
    this.message = 'Учетная запись заблокирована';
  }

  public makeErrorResult (exception: Exception) {
    this.logonStatus = LogonStatus.Error;
    this.exception = exception;
    this.sessionUser = SessionUser.anonymousUser;
    this.message = 'Ошибка входа';
  }

  public makeLogoffResult () {
    this.logonStatus = LogonStatus.Logoff;
    this.sessionUser = SessionUser.anonymousUser;
    this.message = 'Не авторизован';
  }
}
