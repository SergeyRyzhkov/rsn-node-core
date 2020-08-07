
import { Response } from 'express';
import { ResponseWrapper } from './ResponseWrapper';
import { Exception } from '@/exceptions/Exception';
import { ClientNotifyMessage } from './ClientNotifyMessage';
import { createParamDecorator } from 'routing-controllers';
import { DisplayFormatType } from '@/models/DisplayFormatType';
import { InternalServerError } from '@/exceptions/serverErrors/InternalServerError';

export class BaseController {

  public createSuccessResponseWithMessage (result: any, res: Response, statusCode = res.statusCode, message: ClientNotifyMessage, redirectUrl?: string) {
    const response = ResponseWrapper.createSuccsess(result, statusCode, message, redirectUrl);
    return res.status(statusCode).json(response);
  }

  public createSuccessResponse (result: any, res: Response, statusCode = res.statusCode, redirectUrl?: string) {
    const response = ResponseWrapper.createSuccsess(result, statusCode, null, redirectUrl);
    return res.status(statusCode).json(response);
  }

  public createFailureResponse (exc: Exception, res: Response, redirectUrl?: string) {
    const err = !!exc ? exc : new InternalServerError('Unknown')
    const response = ResponseWrapper.createFailure(err, null, redirectUrl);
    return res.status(err.status).json(response);
  }

  public createFailureResponseWithMessage (exc: Exception, res: Response, message: ClientNotifyMessage, redirectUrl?: string) {
    const err = !!exc ? exc : new InternalServerError('Unknown')
    const response = ResponseWrapper.createFailure(err, message, redirectUrl);
    return res.status(err.status).json(response);
  }

  // FIXME: Порт и url
  public createRedirectResponse (response: Response, location: string) {
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

// FIXME: Rename
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


