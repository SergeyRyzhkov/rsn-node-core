import { SessionUser } from './SessionUser';
import { Exception } from '@/exceptions/Exception';

export enum RegistrationStatus {
  OK,
  AlreadyExists,
  InvalidEmail,
  PasswordIsNotStrong,
  Error,
  Unknown
};

export class RegistrationResult {
  public sessionUser: SessionUser = SessionUser.anonymousUser;
  public registrationStatus: RegistrationStatus = RegistrationStatus.Unknown;
  public exception: Exception = null;
  public message: string;

  public makeOKResult (sessionUser: SessionUser) {
    this.registrationStatus = RegistrationStatus.OK;
    this.sessionUser = sessionUser;
  }

  public makeAlreadyExistsResult () {
    this.registrationStatus = RegistrationStatus.AlreadyExists;
    this.sessionUser = SessionUser.anonymousUser;
    this.message = 'Пользователь с данным email уже существует';
  }

  public makeInvalidEmailResult () {
    this.registrationStatus = RegistrationStatus.InvalidEmail;
    this.sessionUser = SessionUser.anonymousUser;
    this.message = 'Неверно указан email';
  }

  public makePasswordIsNotStrongResult () {
    this.registrationStatus = RegistrationStatus.PasswordIsNotStrong;
    this.sessionUser = SessionUser.anonymousUser;
    this.message = 'Пароль должен содержать не менее 8 символов включая цифры, прописные и строчные буквы';
  }

  public makeErrorResult (exception: Exception) {
    this.registrationStatus = RegistrationStatus.Error;
    this.exception = exception;
    this.sessionUser = SessionUser.anonymousUser;
    this.message = 'Ошибка';
  }
}
