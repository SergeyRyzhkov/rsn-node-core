
import { Request, Response } from 'express';
import { ResponseWrapper } from './ResponseWrapper';
import { Exception } from '@/exceptions/Exception';
import { AppConfig } from '@/utils/Config';
import { ClientNotifyMessage } from './ClientNotifyMessage';
import { createParamDecorator } from 'routing-controllers';
import { DisplayFormatType } from '@/models/DisplayFormatType';
import { InternalServerError } from '@/exceptions/serverErrors/InternalServerError';
import { SessionUser } from '@/services/security/user/SessionUser';

export class BaseController {

  public static setJWTCookie (res: Response, accessToken: string) {
    //  public static addJWTCookie (res: Response, payload: any, accessToken?: string) {
    const cookie = {
      //      payload,
      accessToken
    }

    // FIXME: В настройки
    const cookieOptions = {
      // expires: new Date(Date.now() + AppConfig.authConfig.cookieExpires),
      maxAge: 600e3,
      httpOnly: true,
      hostOnly: false,
      secure: false,
      sameSite: true
    }

    if (res.app.get('env') === 'production') {
      cookieOptions.secure = true;
    }

    res.cookie(AppConfig.authConfig.cookieName, JSON.stringify(cookie), cookieOptions);
  }

  public static clearJWTCookie (res: Response) {
    res.clearCookie(AppConfig.authConfig.cookieName);
  }

  public static setJWTHeader (res: Response, jwt: string) {
    res.setHeader(AppConfig.authConfig.jwtHeaderName, jwt);
  }

  public static removeJWTHeader (res: Response) {
    res.removeHeader(AppConfig.authConfig.jwtHeaderName);
  }

  public static setSessionUserAnonymous (req: Request, res: Response) {
    if (!!req && !!req.session) {
      req.session.sessionUser = SessionUser.anonymousUser.appUserId;
    }
    BaseController.clearJWTCookie(res);
    BaseController.removeJWTHeader(res);
  }

  public static setSessiontUser (sessionUser: SessionUser, req: Request) {
    if (!!req && !!req.session) {
      req.session.sessionUser = sessionUser;
    }
  }

  public static getSessionUser (req: Request) {
    return this.isUserAuthorized(req) ? req.session.sessionUser : SessionUser.anonymousUser;
  }


  public static isUserAuthorized (req: Request) {
    return !!req && !!req.session && !!req && !!req.session.sessionUser && req.session.sessionUser.appUserId !== 0;
  }

  public static createSuccessResponseWithMessage (result: any, res: Response, statusCode = res.statusCode, message: ClientNotifyMessage, redirectUrl?: string) {
    const response = ResponseWrapper.createSuccsess(result, statusCode, message, redirectUrl);
    return res.status(statusCode).json(response);
  }

  public static createSuccessResponse (result: any, res: Response, statusCode = res.statusCode, redirectUrl?: string) {
    const response = ResponseWrapper.createSuccsess(result, statusCode, null, redirectUrl);
    return res.status(statusCode).json(response);
  }

  public static createFailureResponse (exc: Exception, res: Response, redirectUrl?: string) {
    const err = !!exc ? exc : new InternalServerError('Unknown')
    const response = ResponseWrapper.createFailure(err, null, redirectUrl);
    return res.status(err.status).json(response);
  }

  public static createFailureResponseWithMessage (exc: Exception, res: Response, message: ClientNotifyMessage, redirectUrl?: string) {
    const err = !!exc ? exc : new InternalServerError('Unknown')
    const response = ResponseWrapper.createFailure(err, message, redirectUrl);
    return res.status(err.status).json(response);
  }

  // FIXME: Порт
  public static createRedirectResponse (response: Response, location: string) {
    const loc = process.env.NODE_ENV === 'development' ? `https://dom.npobaltros.ru/` : location
    return this.createSuccessResponse({}, response.location(loc), 302);
  }
}

export const displayFormatTypeFromRequest = (options?: { required?: boolean }) => {
  return createParamDecorator({
    required: options && options.required ? true : false,
    value: (action) => {
      return action.request.query.format === DisplayFormatType.Grid ? DisplayFormatType.Grid : DisplayFormatType.Tile;
    }
  })
}

export const sortFilterPaginationFromRequest = (options?: { required?: boolean }) => {
  return createParamDecorator({
    required: options && options.required ? true : false,
    value: (action) => {
      return {
        sort: {
          sortField: action.request.query.sortfield || null,
          sortType: action.request.query.sorttype || 'DESC'
        },
        pagination:
        {
          offset: (action.request.query.offset != null && action.request.query.offset !== 'undefined') ? action.request.query.offset : 0,
          limit: (action.request.query.limit != null && action.request.query.limit !== 'undefined') ? action.request.query.limit : 20
        },
      };
    }
  })
}


