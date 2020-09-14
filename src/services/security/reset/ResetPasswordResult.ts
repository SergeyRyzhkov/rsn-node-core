import { SessionUser } from '../../../models/security/SessionUser';

export enum ResetPasswordStatus {
  OK,
  RequereConfirmByMail,
  RequereConfirmBySmsCode,
  ResetPasswordExpaired,
  Failed,
  Unknown
}

export class ResetPasswordResult {
  public sessionUser: SessionUser = SessionUser.anonymousUser;
  public status: ResetPasswordStatus = ResetPasswordStatus.Unknown;
  public message: string;
  public newAccessToken: string;

  public makeResetPasswordOK (sessionUser: SessionUser, message: string) {
    this.status = ResetPasswordStatus.OK;
    this.sessionUser = sessionUser;
    this.message = message;
    return this;
  }

  public makeRequereConfirmByEmail (message: string) {
    this.status = ResetPasswordStatus.RequereConfirmByMail;
    this.message = message;
    return this;
  }

  public makeRequereConfirmBySmsCode (message: string) {
    this.status = ResetPasswordStatus.RequereConfirmBySmsCode;
    this.message = message;
    return this;
  }

  public makeResetPasswordExpaired (message: string) {
    this.status = ResetPasswordStatus.ResetPasswordExpaired;
    this.message = message;
    return this;
  }

  public makeFailed (message: string) {
    this.status = ResetPasswordStatus.Failed;
    this.message = message;
    return this;
  }

}

