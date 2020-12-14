import { decode, sign, verify } from 'jsonwebtoken';
import { plainToClass } from 'class-transformer';
import { SessionUser } from '../../models/security/SessionUser';
import { ConfigManager } from '@/ConfigManager';
import { SecurityConfig } from './SecurityConfig';
import { logger } from '@/utils/Logger';

export class JWTHelper {

  private static securityConfig = ConfigManager.instance.getOptionsAsClass(SecurityConfig, "SecurityConfig");

  public static createAndSignJwt (sessionUser: SessionUser, sessionId: string): string {
    const payload = { ...sessionUser };
    this.deleteClaimProperties(payload);
    const jwtOptions = { ...this.securityConfig.jwtSignOptions, jwtid: sessionId };
    return sign(payload, this.securityConfig.jwtSecretKey, jwtOptions);
  }

  public static verifyAccessToken (token: string) {
    return verify(token, this.securityConfig.jwtSecretKey, this.securityConfig.jwtSignOptions);
  }

  public static getJwtId (token: string) {
    const payload = decode(token, { complete: false, json: true }) as any;
    return !!payload && !!payload.jti ? payload.jti : null;
  }


  public static getTokenUser (token: string): SessionUser {
    let sessionUser: SessionUser = SessionUser.anonymousUser;
    const payload = decode(token, { complete: false, json: true });

    if (!!payload) {
      this.deleteClaimProperties(payload);
      sessionUser = plainToClass(SessionUser, payload)
    }
    return sessionUser;
  }

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
