export interface IMailMessage {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: string;
}

