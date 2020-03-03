
export  class SessionUser {

  public static anonymousUser: SessionUser = new SessionUser();

  public appUserId: number = 0;
  public appUserEmail: string = 'Гость';
  public appUserBlockedInd: number = 0;
  public appUserRegDate: string;
  public appUserRegVerifiedInd: number;

  public userSnProfileId: number = 0;
  public userSnProfileType: string = '';
  public userSnProfileNick: string = '';
  public userSnProfileAvatar: string = '';
  public userSnProfileLink: string = '';
  public userSnProfileEmail: string = '';

  public reset: boolean = false;
}
