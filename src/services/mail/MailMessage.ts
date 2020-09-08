import { Attachment } from 'nodemailer/lib/mailer';

export interface MailMessage {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: Attachment[];
}

