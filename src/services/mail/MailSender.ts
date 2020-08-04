import nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { IMailMessage } from './IMailMessage';
import { ISmtpOptions } from './ISmtpOptions';
import Mail from 'nodemailer/lib/mailer';

// FIXME: Как базовый сервис?
export class MailSender {

  public smtpTransport: Mail;

  constructor(options: ISmtpOptions) {
    this.smtpTransport = nodemailer.createTransport(options);
  }

  public async send (message: IMailMessage): Promise<SentMessageInfo> {
    return this.smtpTransport.sendMail(message);
  }

  public async sendFromTemplate (message: IMailMessage, templateName: string, format: (template: string) => string) {
    const filePath = path.resolve('mail', templateName + '.html');
    if (fs.existsSync(filePath)) {
      const templateContent = fs.readFileSync(filePath, 'utf8');
      message.text = !!format ? format(templateContent) : templateContent;
      message.html = message.text;
      return this.send(message);
    }
  }
}
