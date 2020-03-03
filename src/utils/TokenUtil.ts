
import * as jwt from 'jsonwebtoken';
import { AppConfig } from '@/utils/Config';
import { SessionUser } from '@/entities/users/SessionUser';
import { ClassTransform } from './ClassTransform';

export class TokenUtil {

  public static generateAccessToken (sessionUser: SessionUser, sessionId: string): string {
    const payload = { ...sessionUser };
    this.deleteClaimProperties(payload);
    const jwtOptions = { ...AppConfig.authConfig.JWT.access.options, jwtid: sessionId };
    return jwt.sign(payload, AppConfig.authConfig.JWT.access.secretKey, jwtOptions);
  }

  public static refreshAccessToken (oldToken: string): string {
    const oldPayload = jwt.decode(oldToken, { complete: false, json: true }) as any;
    const sessionId = oldPayload.jti;
    this.deleteClaimProperties(oldPayload);
    const jwtOptions = { ...AppConfig.authConfig.JWT.access.options, jwtid: sessionId };
    return jwt.sign(oldPayload, AppConfig.authConfig.JWT.access.secretKey, jwtOptions);
  }

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

  public static getSessionUserId (token: string): number {
    const payload = jwt.decode(token, { complete: false, json: true }) as any;
    if (payload && payload.jti) {
      const { appUserId } = payload
      return appUserId;
    }
    return 0;
  }

  public static getSessionUser (token: string): SessionUser {
    const payload = jwt.decode(token, { complete: false, json: true });
    this.deleteClaimProperties(payload);
    return ClassTransform.plainToClassInstanceOne<SessionUser>(payload, SessionUser)
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
