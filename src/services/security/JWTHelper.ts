
import jwt, { } from 'jsonwebtoken';
import { AppConfig } from '@/utils/Config';
import { plainToClass } from 'class-transformer';
import { SessionUser } from '../../models/security/SessionUser';

export class JWTHelper {

  public static createAndSignJwt (sessionUser: SessionUser, sessionId: string): string {
    const payload = { ...sessionUser };
    this.deleteClaimProperties(payload);
    const jwtOptions = { ...AppConfig.authConfig.JWT.access.options, jwtid: sessionId };
    return jwt.sign(payload, AppConfig.authConfig.JWT.access.secretKey, jwtOptions);
  }

  // public static extendAccessToken (oldToken: string): string {
  //   const oldPayload = jwt.decode(oldToken, { complete: false, json: true }) as any;
  //   const sessionId = oldPayload.jti;
  //   this.deleteClaimProperties(oldPayload);
  //   const jwtOptions = { ...AppConfig.authConfig.JWT.access.options, jwtid: sessionId };
  //   return jwt.sign(oldPayload, AppConfig.authConfig.JWT.access.secretKey, jwtOptions);
  // }

  public static verifyAccessToken (token: string) {
    const jwtOptions = AppConfig.authConfig.JWT.access.options;
    return jwt.verify(token, AppConfig.authConfig.JWT.access.secretKey, jwtOptions);
  }

  public static getJwtId (token: string) {
    const payload = jwt.decode(token, { complete: false, json: true }) as any;
    if (payload && payload.jti) {
      return payload.jti;
    }
  }


  public static getTokenUser (token: string): SessionUser {
    let sessionUser: SessionUser = SessionUser.anonymousUser;

    const payload = jwt.decode(token, { complete: false, json: true });
    if (!!payload) {
      this.deleteClaimProperties(payload);
      sessionUser = plainToClass(SessionUser, payload)
    }

    return sessionUser;
  }

  // FIXME: Wthat is the options // mutatePayload ?
  private static deleteClaimProperties (payload: any) {
    delete payload.exp;
    delete payload.jti;
    delete payload.nbf;
    delete payload.aud;
    delete payload.sub;
    delete payload.iss;
    delete payload.iat;
  }
}
