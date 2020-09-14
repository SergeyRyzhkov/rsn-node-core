import { SessionUser } from '../../../models/security/SessionUser';

export enum RegistrationStatus {
  OK,
  RequereConfirmBySmsCode,
  RequereConfirmByEmail,
  Invalid,
  Unknown
}

export class RegistrationResult {
  public sessionUser: SessionUser = SessionUser.anonymousUser;
  public registrationStatus: RegistrationStatus = RegistrationStatus.Unknown;
  public message: string;
  public newAccessToken: string;

  public makeOK (sessionUser: SessionUser, message: string) {
    this.registrationStatus = RegistrationStatus.OK;
    this.sessionUser = sessionUser;
    this.message = message;
    return this;
  }

  public makeRequereConfirmBySmsCode (sessionUser: SessionUser, message: string) {
    this.registrationStatus = RegistrationStatus.RequereConfirmBySmsCode;
    this.sessionUser = sessionUser;
    this.message = message;
    return this;
  }

  public makeRequereConfirmByEmail (message: string) {
    this.registrationStatus = RegistrationStatus.RequereConfirmByEmail;
    this.message = message;
    return this;
  }

  public makeInvalid (message?: string) {
    this.registrationStatus = RegistrationStatus.Invalid;
    this.message = message;
    return this;
  }
}
