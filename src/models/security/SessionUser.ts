
export class SessionUser {

  public static anonymousUser: SessionUser = new SessionUser();

  public appUserId = 0;
  public appUserName = 'Гость';
  public appUserBlockedInd = 0;
  public appUserRegDate: string;
  public appUserRegVerifiedInd: number;

  public userSnProfileId = 0;
  public userSnProfileType = '';
  public userSnProfileNick = '';
  public userSnProfileAvatar = '';
  public userSnProfileLink = '';
  public userSnProfileEmail = '';

  public reset = false;

  public roleIdList: number;
}
