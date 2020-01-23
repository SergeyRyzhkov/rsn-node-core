import SessionUser from './SessionUser';
import { Exception } from '@/exceptions/Exception';

export enum ChangePasswordStatus {
  OK,
  PasswordIsNotStrong,
  OldAndNewPasswordAreEquals,
  Failed,
  Unknown
};


export class ChangePasswordResult {
  public sessionUser: SessionUser = SessionUser.anonymousUser;
  public status: ChangePasswordStatus = ChangePasswordStatus.Unknown;
  public exception: Exception = null;
  public message: string;

  public makeUnknownResult () {
    this.status = ChangePasswordStatus.Unknown;
  }

  public makeOKResult (sessionUser: SessionUser) {
    this.status = ChangePasswordStatus.OK;
    this.exception = null;
    this.sessionUser = sessionUser;
  }

  public makePasswordIsNotStrongResult (sessionUser: SessionUser) {
    this.status = ChangePasswordStatus.PasswordIsNotStrong;
    this.sessionUser = sessionUser;
    this.message = 'Пароль должен содержать не менее 8 символов включая цифры, прописные и строчные буквы';
  }

  public makeOldAndNewPasswordAreEquals (sessionUser: SessionUser) {
    this.status = ChangePasswordStatus.OldAndNewPasswordAreEquals;
    this.sessionUser = sessionUser;
    this.message = 'Новый и предыдущий пароли совпадают';
  }

  public makeFailedResult (sessionUser: SessionUser) {
    this.status = ChangePasswordStatus.Failed;
    this.sessionUser = sessionUser;
    this.message = 'Ошибка входа. Неверный идентификатор пользователя или пароль';
  }

}

