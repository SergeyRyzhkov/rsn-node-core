import nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { MailMessage } from './MailMessage';
import { SmtpOptions } from './SmtpOptions';
import Mail from 'nodemailer/lib/mailer';
import { ConfigManager } from '@/ConfigManager';

export class MailSender {

  public smtpTransport: Mail;

  constructor(options?: SmtpOptions) {
    const opt = options || ConfigManager.instance.getOptionsAsPlain("SmtpOptions");
    this.smtpTransport = nodemailer.createTransport(opt);
  }

  public async send (message: MailMessage): Promise<SentMessageInfo> {
    return this.smtpTransport.sendMail(message);
  }

  public async sendFromTemplate (message: MailMessage, templateName: string, format: (template: string) => string) {
    const filePath = path.resolve('mail', templateName + '.html');
    if (fs.existsSync(filePath)) {
      const templateContent = fs.readFileSync(filePath, 'utf8');
      message.text = !!format ? format(templateContent) : templateContent;
      message.html = message.text;
      return this.send(message);
    }
  }
}
