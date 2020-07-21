export interface ISmsMessage {
  toPhone: number;
  message: string;
  from?: string;
  time?: number;
}
