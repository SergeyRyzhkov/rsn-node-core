export class SmsResponse {
  status: string;
  statusCode?: number;
  statusText?: string;
  balance?: number;
  smsInfoList: ISmsInfo[] = [];
}

export interface ISmsInfo {
  id: number;
  status: string;
  statusCode: number;
  toPhone?: number;
  message?: string;
  dateTime?: Date;
}