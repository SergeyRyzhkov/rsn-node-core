export interface ISmtpOptions {
  host: string;
  port: number;
  secure: false;
  pool: true;
  maxConnections: 1;
  maxMessages: 100;
  auth: {
    user: string
    pass: string
  }
};