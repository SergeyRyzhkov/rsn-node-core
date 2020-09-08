export interface SmsMessage {
  toPhone: number;
  message: string;
  from?: string;
  time?: number;
}
